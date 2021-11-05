addEventListener("fetch", event => event.respondWith(handleRequest(event.request).catch(err => new Response(err.stack, {status: 500}))));

function checkLink(link) {
    let linkSplit = link.split("/");
    if (linkSplit.length < 4) return false;
    if (linkSplit[0] !== "https:" && linkSplit[0] !== "http:") return false;
    if (linkSplit[1] !== "") return false;
    return linkSplit;
}

let mapping = ['0', '1', '2', '3', '4', '5', ' 6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];

function uint8ArrayToString(array) {
    let ret = "";
    array.map(value => ret += mapping[value % 62]);
    return ret;
}

async function addLink(link) {
    let linkSplit = checkLink(link);
    if (linkSplit === false) return "link error";
    let linkUint8Array = new Uint8Array(await crypto.subtle.digest({
        name: "MD5",
    }, new TextEncoder().encode(link)));
    let shortLink = '/' + uint8ArrayToString(linkUint8Array.subarray(0, 6));

    let checkFromKV = await ShortLink.get(shortLink);
    if (checkFromKV !== null && checkFromKV !== link) {
        shortLink = '/' + uint8ArrayToString(linkUint8Array.subarray(10, 16));
        checkFromKV = await ShortLink.get(shortLink);
        if (checkFromKV !== null && checkFromKV !== link) return "no extra space";
    }

    await ShortLink.put(shortLink, link);
    return shortLink;
}

async function setLink(shortLink, link) {
    if (await ShortLink.get(shortLink) !== null) return false;
    await ShortLink.put(shortLink, link);
    return true;
}

async function deleteLink(shortLink) {
    await ShortLink.delete(shortLink);
}

async function handleRequest(request) {
    if (request.headers.get("Authorization") !== await ShortLinkApi.get("code")) return new Response("Unauthorized operation.", {status: 403});
    let response = {code: 0};
    let body = await request.json();
    switch (request.url.split("/")[3]) {
        case "alive":
            response.msg = "ShortApi ctrl server.";
            break;
        case "add":
            response.msg = await addLink(body.link);
            if (!response.msg.startsWith("http")) response.code = 1;
            break;
        case "set":
            if (!setLink(body.shortLink, body.link)) response.code = 1;
            break;
        case "delete":
            await deleteLink(body.shortLink);
            break;
        default:
            return new Response("Command not found.", {status: 404});
    }

    return new Response(JSON.stringify(response));
}
