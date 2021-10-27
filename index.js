addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request).catch(err => new Response(err.stack, {status: 500})));
});

async function addLink(link) {
    return "/link";
}

async function setLink(shortLink, link) {
    if (await ShortLink.get(shortLink) !== null) return false;
    ShortLink.put(shortLink, link);
    return true;
}

function deleteLink(shortLink) {
    ShortLink.delete(shortLink);
}

async function handleRequest(request) {
    if (request.headers.get("Authorization") !== ShortLinkApi.get("code")) return new Response("Unauthorized operation.", {status: 403});
    let response = {code: 0};
    let body = await request.json();
    switch (request.url.split("/")[3]) {
        case "test":
            response.msg = "ShortApi ctrl server.";
            break;
        case "add":
            let link = await addLink(body.link);
            if (link === null) response.code = 1;
            else response.msg = link;
            break;
        case "set":
            if (!setLink(body.shortLink, body.link)) response.code = 1;
            break;
        case "delete":
            deleteLink(body.shortLink);
            break;
        default:
            return new Response("Command not found.", {status: 404});
    }
    return new Response(JSON.stringify(response));
}
