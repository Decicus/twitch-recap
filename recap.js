const parameters = {
    viewer: [
        {
            title: 'First top channel watched (#1)',
            id: 'mi_channel_id',
        },
        {
            title: 'Second top channel watched (#2)',
            id: 'mi_channel_id_2',
        },
        {
            title: 'Third top channel watched (#3)',
            id: 'mi_channel_id_3',
        },
        {
            title: 'Total channel points earned',
            id: 'mi_channel_points',
        },
        {
            title: 'Emote #1 (URL)',
            id: 'mi_emote_1',
        },
        {
            title: 'Emote #2 (URL)',
            id: 'mi_emote_2',
        },
        {
            title: 'Emote #3 (URL)',
            id: 'mi_emote_3',
        },
        {
            title: 'Emote #4 (URL)',
            id: 'mi_emote_4',
        },
        {
            title: 'Emote #5 (URL)',
            id: 'mi_emote_5',
        },
        {
            title: 'Emote #6 (URL)',
            id: 'mi_emote_6',
        },
        {
            title: 'Unknown, changing it doesn\'t seem to do anything to the actual image',
            id: 'mi_image_1',
            fallback: '0',
        },
        {
            title: 'Two-letter language code (e.g. EN, NO, KO etc.)',
            id: 'mi_lang',
            fallback: 'EN',
        },
        {
            title: 'Total chat messages',
            id: 'mi_messages_sent',
        },
        {
            title: "User ID, but doesn't seem to be used in the image.",
            id: 'mi_u',
            fallback: '12826',
        },
        {
            title: 'User ID, used for avatar',
            id: 'mi_user_id',
        },
        {
            title:
                'The "username" used at the bottom: "Your_Username_Here\'s 2020 Twitch recap"',
            id: 'mi_username',
        },
    ],
    streamer: [
        {
            title: 'Total hours watched, by viewers of your channel, in 2020',
            id: 'mi_hours_watched',
        },
        {
            title: 'Total hours broadcast (in 2020)',
            id: 'mi_hours_broadcast',
        },
        {
            title: 'Unique followers (in 2020)',
            id: 'mi_followers',
        },
        {
            title: 'Top game streamed #1',
            id: 'mi_game_name',
        },
        {
            title: 'Top game streamed #2',
            id: 'mi_game_name_2',
        },
        {
            title: 'Top game streamed #3',
            id: 'mi_game_name_3',
        },
        {
            title: 'Most used emote #1 (URL)',
            id: 'mi_emote_1',
        },
        {
            title: 'Most used emote #2 (URL)',
            id: 'mi_emote_2',
        },
        {
            title: 'Most used emote #3 (URL)',
            id: 'mi_emote_3',
        },
        {
            title: 'Most used emote #4 (URL)',
            id: 'mi_emote_4',
        },
        {
            title: 'Most used emote #5 (URL)',
            id: 'mi_emote_5',
        },
        {
            title: 'Most used emote #6 (URL)',
            id: 'mi_emote_6',
        },
        {
            title: 'Unknown, changing it doesn\'t seem to do anything to the actual image',
            id: 'mi_image_1',
            fallback: '0',
        },
        {
            title: 'Two-letter language code (e.g. EN, NO, KO etc.)',
            id: 'mi_lang',
            fallback: 'EN',
        },
        {
            title: 'Total chat messages',
            id: 'mi_messages_sent',
        },
        {
            title: "User ID, but doesn't seem to be used in the image.",
            id: 'mi_u',
            fallback: '25622621',
        },
        {
            title: 'User ID, used for avatar',
            id: 'mi_user_id',
        },
        {
            title:
                'The "username" used at the bottom: "Your_Username_Here\'s 2020 Twitch recap"',
            id: 'mi_username',
        },
        {
            title: 'Unknown but its a required field...',
            id: 'url',
            fallback: 'http://mi.twitch.tv/p/rp/86a03766635d0c2f/url',
        },
    ],
};

// ID for twitch.tv/twitch
const defaultId = '12826';
/**
 * Use DecAPI to get the user's ID from their username.
 * Shoutout to... me. I wrote DecAPI. I know, I'm really cool. 😎
 */
const fetchedUserIds = {};
async function getUserId(username)
{
    /**
     * We already got the user ID of this username.
     */
    if (fetchedUserIds[username]) {
        return fetchedUserIds[username];
    }

    const url = `https://decapi.me/twitch/id/${username}`;
    const response = await fetch(url);

    /**
     * Server error, or route returned 404 because the input is malformed.
     */
    if (!response.ok) {
        return defaultId;
    }

    const id = await response.text();
    const isOnlyDigits = /^\d+$/.test(id);

    /**
     * Error from DecAPI.
     * DecAPI returns 200 OK, even for 'error' responses, for compatibility with bots.
     * So gotta manually parse that.
     */
    if (!isOnlyDigits) {
        return defaultId;
    }

    fetchedUserIds[username] = id;
    return id;
}

/**
 * Replace known instances with the highest quality image URL.
 */
function maxEmoteImageUrl(emoteUrl)
{
    if (!emoteUrl) {
        return emoteUrl;
    }

    const emoteCdns = {
        'static-cdn.jtvnw.net': {
            search: /\d.0$/,
            replace: '3.0',
        },
        'cdn.frankerfacez.com': {
            search: /\d$/,
            replace: '4',
        },
        'cdn.betterttv.net': {
            search: /\dx$/,
            replace: '3x',
        },
    };

    const cdnHostnames = Object.keys(emoteCdns);

    const url = new URL(emoteUrl);
    const hostname = url.hostname;

    /**
     * Return as-is when it's a URL we don't recognize.
     */
    if (!cdnHostnames.includes(hostname)) {
        return emoteUrl;
    }

    const config = emoteCdns[hostname];
    const { search, replace } = config;
    return emoteUrl.replace(search, replace);
}

/**
 * Load previously generated image from localStorage.
 */
function loadStoredParameters(selectedParam)
{
    const params = localStorage.getItem(`${selectedParam}Parameters`);
    if (!params) {
        return;
    }

    let stored = {};
    try {
        stored = JSON.parse(params);
    }
    catch (err) {
        console.error('uwu cant load your previous settings uwu');
        return;
    }

    for (const field of parameters[selectedParam])
    {
        const { id } = field;
        const input = document.querySelector(`#${id}`);

        if (!input || !stored[id]) {
            continue;
        }

        input.value = stored[id];
    }
}

/**
 * We need to convert these fields from usernames to IDs.
 */
const fetchIds = [
    'mi_channel_id',
    'mi_channel_id_2',
    'mi_channel_id_3',
    'mi_user_id',
];

/**
 * Generate the actual image URL
 */
const storedValues = {};
const baseUrls = {
    viewer: 'https://mi.twitch.tv/p/rp/9d573ff64376de87/url',
    streamer: 'https://mi.twitch.tv/p/rp/86a03766635d0c2f/url',
};
async function generateImageUrl(selectedParam) {
    const url = new URL(baseUrls[selectedParam]);
    const searchParams = url.searchParams;

    for (const field of parameters[selectedParam])
    {
        const { id } = field;
        const fallback = field.fallback || '';
        
        const input = document.querySelector(`#${id}`);

        /**
         * Input field doesn't exist, we set the fallback value.
         */
        if (!input) {
            searchParams.set(id, fallback);
            continue;
        }

        /**
         * `fetchIds` doesn't contain this field
         * So we don't pass the parameter to the "user ID retrieval" function.
         */
        let value = input.value;

        /**
         * Custom handling for Twitch, BTTV and FFZ emotes.
         */
        if (id.includes('mi_emote_')) {
            value = maxEmoteImageUrl(value);
            input.value = value;
        }

        storedValues[id] = value;

        if (!fetchIds.includes(id)) {
            searchParams.set(id, value);
            continue;
        }

        value = value.toLowerCase();
        const userId = await getUserId(value);
        searchParams.set(id, userId);
    }

    localStorage.setItem(`${selectedParam}Parameters`, JSON.stringify(storedValues));
    return url.toString();
}

let selectedParam = 'viewer';
window.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#generate-image');
    const recap = document.querySelector('#recap');

    if (button) {
        button.addEventListener('click', async () => {
            if (button.classList.contains('disabled')) {
                return;
            }
            
            button.classList.add('disabled');

            if (!recap.classList.contains('hidden')) {
                recap.classList.add('hidden');
            }

            /**
             * Generate the image URL
             */
            const imageUrl = await generateImageUrl(selectedParam);
            const recapUrl = recap.querySelector('#recap-url');
            const img = recap.querySelector('#recap-image');

            console.log(`Generated image URL: ${imageUrl}`);

            /**
             * Set the URL
             */
            recapUrl.setAttribute('href', imageUrl);
            img.src = imageUrl;

            /**
             * Display the section and scroll the user to the section.
             */
            recap.classList.remove('hidden');
            recap.scrollIntoView();

            /**
             * Re-enable button
             */
            button.classList.remove('disabled');
        });
    }

    loadStoredParameters(selectedParam);
});