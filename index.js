// Local development entry point.
// Production/Vercel uses ./api/index.js instead, so this file only boots a
// real HTTP server when you run `npm start` on your machine.
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

server.on("error", (error) => {
    console.error("Server error:", error);
});
