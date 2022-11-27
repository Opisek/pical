import express from "express";
import socketio from "socket.io";
import http from "http";
import path from "path";

export default class webServer {
    private listeners: {[key: string]: eventListener};

    public listen(event: string, listener: eventListener) {
        this.listeners[event] = listener;
    }

    private emit(event: string, data: any): any {
        if (event in this.listeners) return this.listeners[event].run(data);
        return {};
    }

    public constructor(port: number, publicPath: string) {
        // listening
        this.listeners = {};
        // set up webserver
        const webServer = express();
        const httpServer = http.createServer(webServer);
        const socketServer = new socketio.Server(httpServer);

        webServer.use(express.json());
        webServer.use(express.urlencoded({extended:false}));
        webServer.set("view engine", "ejs");

        webServer.set("views", path.join(publicPath + "/ejs"))
        webServer.set("/partials", path.join(publicPath, "/partials"));
        webServer.use("/css", express.static(path.join(publicPath, "/css")));
        webServer.use("/js", express.static(path.join(publicPath, "/js")));
        webServer.use("/images", express.static(path.join(publicPath, "/images")));

        webServer.set("trust proxy", "loopback, linklocal, uniquelocal")

        // fetch index
        webServer.get("/", (req, res) => {
            //if (authenticate(req, res)) return;

            //res.render(`index`, {host: `https://${host}`});
            res.render("index");
            res.end();
        });

        // 404
        webServer.get("*", (req, res) => {
            res.status(404);
            res.render("404", { host: `${req.protocol}://${req.hostname}/` });
            res.end();
        });

        // socketio
        socketServer.on("connection", socket => {
            socket.on("requestEventsMonth", async (data, callback) => callback(this.emit("requestEventsMonth", data)));
        });

        httpServer.listen(port);
        console.log("listening on " + port);
    }
}

interface eventListener {
    run(data: any): any;
}