import { Request, Response } from "express";
import zernio from "../config/zernio.js";
import { User } from "../models/User.js";
import { Account } from "../models/Account.js";
import { AuthRequest } from "../middlewares/authMiddlewware.js";
import fs from "fs";

const logFile = "C:\\Users\\andal\\Downloads\\zernio_debug.log";

const writeLog = (msg: string) => {
    const timestamp = new Date().toISOString();
    const fullMsg = `${timestamp} - ${msg}\n`;
    try {
        fs.appendFileSync(logFile, fullMsg);
    } catch (e) {
        console.error("Failed to write log:", e);
    }
};

// Helper to ensure user has a Zernio Profile.
const getOrCreateZernioProfile = async (user:any) : Promise<string> => {
    try {
       writeLog(`Fetching profiles for user: ${user?.email}`);
       const result = await zernio.profiles.listProfiles()
       const data = result.data as any;
       writeLog(`listProfiles response: ${JSON.stringify(data)}`);
       const profiles: any[] = Array.isArray(data) ? data : data?.profiles || data?.data || [];
       writeLog(`Parsed profiles array length: ${profiles.length}`);

       if(profiles.length > 0){
        const pid = profiles[0]._id || profiles[0].id
        await User.findByIdAndUpdate(user._id, {zernioProfileId: pid})
        writeLog(`Using existing profile: ${pid}`);
        return pid;
       }

       writeLog(`No profiles found, creating new one...`);
       const createResult = await zernio.profiles.createProfile({
        body: {name: `${user.name || user.email}'s workspace`} as any,
       })
       const created = (createResult.data as any)?.profile || createResult.data;
       writeLog(`createProfile response: ${JSON.stringify(created)}`);

       const pid = created?._id || created?.id;

       if(!pid){
        throw new Error("Failed to create Zernio profile — no ID returned")
       }

       await User.findByIdAndUpdate(user._id, {zernioProfileId: pid});
       writeLog(`Created new profile: ${pid}`);
       return pid;
    } catch (error: any) {
        writeLog(`ERROR in getOrCreateZernioProfile: ${error?.message}`);
        writeLog(`Full error: ${JSON.stringify(error)}`);
        throw error;
    }
}


// Generate OAuth authorization URL
// GET /api/auth/:platform
export const generateAuthUrl = async (req: AuthRequest, res: Response) : Promise<void>=> {
    try {
        const {platform} = req.params;
        writeLog(`Starting OAuth flow for platform: ${platform}`);
        
        const profileId = await getOrCreateZernioProfile(req.user);
        writeLog(`Zernio Profile ID: ${profileId}`);

        const origin = req.headers.origin;
        const redirectUrl = `${origin}/accounts`;
        writeLog(`Redirect URL: ${redirectUrl}`);

        writeLog(`Calling Zernio getConnectUrl with platform=${platform}, profileId=${profileId}, redirectUrl=${redirectUrl}`);
        const result = await zernio.connect.getConnectUrl({
            path: {platform: platform as any},
            query: {
                profileId,
                redirect_url: redirectUrl
            }
        })

        const data = result.data as any;
        writeLog(`getConnectUrl response: ${JSON.stringify(data)}`);

        const authUrl = data.authUrl;
        if(!authUrl){
            throw new Error(`Zernio returned no authUrl. Full response: ${JSON.stringify(data)}`)
        }

        res.json({url: authUrl})

    } catch (error: any) {
        writeLog(`ERROR in generateAuthUrl: ${error?.message}`);
        writeLog(`Error response: ${JSON.stringify(error?.response?.data)}`);
        writeLog(`Error status: ${error?.response?.status}`);
        
        // Return detailed error for debugging
        const errorDetails = {
            message: error?.message || "Server error",
            status: error?.response?.status,
            zernioError: error?.response?.data,
            fullError: JSON.stringify(error, null, 2)
        };
        
        const statusCode = error?.response?.status || 500;
        res.status(statusCode).json(errorDetails);
    }
}

// Sync connected accounts from Zernio into MongoDB
// GET /api/auth/sync
export const syncAccounts = async (req: AuthRequest, res: Response) : Promise<void>=>{
    try {
        const profileId = await getOrCreateZernioProfile(req.user);
        const result = await zernio.accounts.listAccounts({
            query: {profileId} as any
        })

        const data = result.data as any;
        const zernioAccounts: any[] = data?.accounts || (Array.isArray(data) ? data : []);
        const supportedPlatforms = ["twitter", "linkedin", "facebook", "instagram"];
        const syncedAccounts = [];

        for(const zAccount of zernioAccounts){
            const zid = zAccount._id || zAccount.id;
            if(!zid){
                console.warn("Skipping account with no ID:", zAccount);
                continue;
            }

            const rawPlatform = (zAccount.platform || zAccount.type || "").toLowerCase();
            const normalizedPlatform = supportedPlatforms.find((p)=>rawPlatform.includes(p));

            if(!normalizedPlatform){
                console.log(`Skipping unsupported platform: "${rawPlatform}"`);
                continue;
            }

            const account = await Account.findOneAndUpdate(
                {zernioAccountId: zid},
                {
                    user: req.user._id,
                    platform: normalizedPlatform,
                    handle: zAccount.username || zAccount.name || zAccount.handle || "Unknown",
                    zernioAccountId: zid,
                    status: "connected",
                    avatarUrl: zAccount.avatarUrl || zAccount.picture || zAccount.profile_image_url,
                },
                {upsert: true, returnDocument: 'after'}
            )
            syncedAccounts.push(account)
        }
        res.json(syncedAccounts)
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
}