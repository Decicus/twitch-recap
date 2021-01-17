/**
 * At first I was only documenting these parameters for my own purposes.
 * Feel free to use them yourself though :)
 */
const parameters = [
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
];

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
async function generateImageUrl() {
    const url = new URL(`https://mi.twitch.tv/p/rp/9d573ff64376de87/url`);
    const searchParams = url.searchParams;
    const emoteCdnRegex = /^https:\/\/static-cdn.jtvnw.net\/emoticons\/v1\/(\d+)\/\d.0$/;

    for (const field of parameters)
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
        storedValues[id] = value;

        if (!fetchIds.includes(id)) {
            searchParams.set(id, value);
            continue;
        }

        const userId = await getUserId(value);
        searchParams.set(id, userId);
    }

    localStorage.setItem('storedParameters', JSON.stringify(storedValues));
    return url.toString();
}

/**
 * Load previously generated image from localStorage.
 */
function loadStoredParameters()
{
    const storedParameters = localStorage.getItem('storedParameters');
    if (!storedParameters) {
        return;
    }

    let stored = {};
    try {
        stored = JSON.parse(storedParameters);
    }
    catch (err) {
        console.error('uwu cant load your previous settings uwu');
        return;
    }

    for (const field of parameters)
    {
        const { id } = field;
        const input = document.querySelector(`#${id}`);

        if (!input || !stored[id]) {
            continue;
        }

        input.value = stored[id];
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#generate-image');
    const recap = document.querySelector('#recap');
    if (button) {
        button.addEventListener('click', async () => {
            if (!recap.classList.contains('hidden')) {
                recap.classList.add('hidden');
            }

            const imageUrl = await generateImageUrl();
            const recapUrl = recap.querySelector('#recap-url');

            recapUrl.setAttribute('href', imageUrl);
            recap.classList.remove('hidden');
            recap.scrollIntoView();
        });
    }

    loadStoredParameters();
});