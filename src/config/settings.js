import { BaseDirectory } from '@tauri-apps/plugin-fs';

export default {
    fs: {
        DEFAULT_DIRECTORY: BaseDirectory.AppData,

    },
    auth: {
        GOOGLE_OAUTH_ENDPOINT: "https://accounts.google.com/o/oauth2/v2/auth",
        SCOPE: "https://www.googleapis.com/auth/drive.file "
            + "https://www.googleapis.com/auth/userinfo.profile "
            + "https://www.googleapis.com/auth/userinfo.email",
    },

    storage: {
        prefixes: {
            gdrive: "gdrive",
            onedrive: "onedrive",
            dropbox: "dropbox"
        },
        paths: {
            access_token: "access_token.db",
            tasks: "tasks.json",
            authcode: "auth_code.db",
            user_profile: "user_profile.json",
        },
        constants: {
            access_token: "access_token",
            tasks: "tasks",
            authcode: "auth_code",
            user_profile: "user_profile",
            last_active_category: "last_active_category"
        }
    },
    api: {
        endpoints: {
            TASKS: "https://tasks.googleapis.com/tasks/v1",
            USER_INFO: "https://www.googleapis.com/oauth2/v3/userinfo",
        }
    }
};