// Chrome DevTools automatically requests
// /.well-known/appspecific/com.chrome.devtools.json on localhost sites.
// A rewrite in next.config.mjs points it here so it no longer 404s.
export const dynamic = "force-static"

export function GET() {
  return Response.json({})
}
