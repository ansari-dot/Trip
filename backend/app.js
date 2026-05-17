import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import connectDB from "./db.js";
import heroRoutes from "./routes/heroRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import tourPackageRoutes from "./routes/tourPackageRoutes.js";
import tourTypeRoutes from "./routes/tourTypeRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import promoModalRoutes from "./routes/promoModalRoutes.js";
import quoteRequestRoutes from "./routes/quoteRequestRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import teamMemberRoutes from "./routes/teamMemberRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import rentalVehicleRoutes from "./routes/rentalVehicleRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import aiPackageRoutes from "./routes/aiPackageRoutes.js";
import { uploadDirectory } from "./utils/multer.js";
import { getCorsAllowedOrigins } from "./utils/corsOrigins.js";

dotenv.config();
const app = express();

const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const corsAllowedOrigins = getCorsAllowedOrigins();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }

            if (corsAllowedOrigins === "*") {
                callback(null, true);
                return;
            }

            if (corsAllowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
    })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

if (NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

app.use("/api/admin", adminRoutes);
app.use("/api/heroes", heroRoutes);
app.use("/uploads", express.static(path.resolve(uploadDirectory)));
app.use("/api/destinations", destinationRoutes);
app.use("/api/tour-packages", tourPackageRoutes);
app.use("/api/tour-types", tourTypeRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/rental-vehicles", rentalVehicleRoutes);
app.use("/api/promo-modal", promoModalRoutes);
app.use("/api/quotes", quoteRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/packages", aiPackageRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        environment: NODE_ENV,
    });
});

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend API is live",
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message =
        NODE_ENV === "production" && statusCode === 500 ?
        "Internal server error" :
        err.message || "Something went wrong";

    if (NODE_ENV !== "production") {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(NODE_ENV !== "production" && { stack: err.stack }),
    });
});

const startServer = async() => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

process.on("unhandledRejection", (error) => {
    console.error("Unhandled rejection:", error.message);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error.message);
    process.exit(1);
});

startServer();

export default app;