addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

async function handleRequest(request) {
 let authCode = request.headers.get("Authorization");
 if (authCode === undefined || authCode === null || authCode === "" || authCode !== ShortLinkApi.get("code")) return new Response("Unauthorized operation.", {
   status: 403
 });
 return new Response("This is 7nm.co api ctrl server.");
}