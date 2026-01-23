import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    // 🔓 PUBLIC ROUTE (Accessible by anyone)
    route('/auth', 'routes/auth.tsx'),

    // 🔒 PROTECTED ROUTES (Wrapped in the Gatekeeper)
    layout("routes/protected.tsx", [
        index("routes/home.tsx"),
        route('/upload', 'routes/upload.tsx'),
        route('/resume/:id', 'routes/resume.tsx'),
        route("codequest", "routes/codequest.tsx"),
        route("roadmap", "routes/roadmap.tsx"),
    ]),
] satisfies RouteConfig;