require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

async function startServer() {
    try {
        await connectDB();

        const PORT = process.env.PORT;

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log("Server start failed:", error);
    }
}

startServer();