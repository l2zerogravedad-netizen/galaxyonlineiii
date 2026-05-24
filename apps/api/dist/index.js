"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const auth_1 = require("./routes/auth");
const empire_1 = require("./routes/empire");
const planet_1 = require("./routes/planet");
const research_1 = require("./routes/research");
const shipyard_1 = require("./routes/shipyard");
const app = (0, fastify_1.default)({ logger: true });
// Plugins
app.register(cors_1.default, { origin: true });
app.register(jwt_1.default, { secret: process.env.JWT_SECRET || 'dev-secret-change-in-production' });
// Routes
app.register(auth_1.authRoutes, { prefix: '/api/auth' });
app.register(empire_1.empireRoutes, { prefix: '/api/empire' });
app.register(planet_1.planetRoutes, { prefix: '/api/planets' });
app.register(research_1.researchRoutes, { prefix: '/api/research' });
app.register(shipyard_1.shipyardRoutes, { prefix: '/api/shipyard' });
// Health check
app.get('/health', async () => ({ status: 'ok', time: new Date().toISOString() }));
// Start server
const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3001');
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`API running on http://localhost:${port}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBOEI7QUFDOUIseURBQWlDO0FBQ2pDLHVEQUErQjtBQUUvQix3Q0FBMkM7QUFDM0MsNENBQStDO0FBQy9DLDRDQUErQztBQUMvQyxnREFBbUQ7QUFDbkQsZ0RBQW1EO0FBRW5ELE1BQU0sR0FBRyxHQUFHLElBQUEsaUJBQU8sRUFBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBRXRDLFVBQVU7QUFDVixHQUFHLENBQUMsUUFBUSxDQUFDLGNBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLGlDQUFpQyxFQUFFLENBQUMsQ0FBQztBQUUzRixTQUFTO0FBQ1QsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDbEQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBWSxFQUFFLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDdEQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBWSxFQUFFLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDdkQsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBYyxFQUFFLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7QUFDMUQsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBYyxFQUFFLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7QUFFMUQsZUFBZTtBQUNmLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFbkYsZUFBZTtBQUNmLE1BQU0sS0FBSyxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQ3ZCLElBQUksQ0FBQztRQUNILE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQztRQUNsRCxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztBQUNILENBQUMsQ0FBQztBQUVGLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZhc3RpZnkgZnJvbSAnZmFzdGlmeSc7XG5pbXBvcnQgY29ycyBmcm9tICdAZmFzdGlmeS9jb3JzJztcbmltcG9ydCBqd3QgZnJvbSAnQGZhc3RpZnkvand0JztcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0BnYWxheHkvZGF0YWJhc2UnO1xuaW1wb3J0IHsgYXV0aFJvdXRlcyB9IGZyb20gJy4vcm91dGVzL2F1dGgnO1xuaW1wb3J0IHsgZW1waXJlUm91dGVzIH0gZnJvbSAnLi9yb3V0ZXMvZW1waXJlJztcbmltcG9ydCB7IHBsYW5ldFJvdXRlcyB9IGZyb20gJy4vcm91dGVzL3BsYW5ldCc7XG5pbXBvcnQgeyByZXNlYXJjaFJvdXRlcyB9IGZyb20gJy4vcm91dGVzL3Jlc2VhcmNoJztcbmltcG9ydCB7IHNoaXB5YXJkUm91dGVzIH0gZnJvbSAnLi9yb3V0ZXMvc2hpcHlhcmQnO1xuXG5jb25zdCBhcHAgPSBmYXN0aWZ5KHsgbG9nZ2VyOiB0cnVlIH0pO1xuXG4vLyBQbHVnaW5zXG5hcHAucmVnaXN0ZXIoY29ycywgeyBvcmlnaW46IHRydWUgfSk7XG5hcHAucmVnaXN0ZXIoand0LCB7IHNlY3JldDogcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCB8fCAnZGV2LXNlY3JldC1jaGFuZ2UtaW4tcHJvZHVjdGlvbicgfSk7XG5cbi8vIFJvdXRlc1xuYXBwLnJlZ2lzdGVyKGF1dGhSb3V0ZXMsIHsgcHJlZml4OiAnL2FwaS9hdXRoJyB9KTtcbmFwcC5yZWdpc3RlcihlbXBpcmVSb3V0ZXMsIHsgcHJlZml4OiAnL2FwaS9lbXBpcmUnIH0pO1xuYXBwLnJlZ2lzdGVyKHBsYW5ldFJvdXRlcywgeyBwcmVmaXg6ICcvYXBpL3BsYW5ldHMnIH0pO1xuYXBwLnJlZ2lzdGVyKHJlc2VhcmNoUm91dGVzLCB7IHByZWZpeDogJy9hcGkvcmVzZWFyY2gnIH0pO1xuYXBwLnJlZ2lzdGVyKHNoaXB5YXJkUm91dGVzLCB7IHByZWZpeDogJy9hcGkvc2hpcHlhcmQnIH0pO1xuXG4vLyBIZWFsdGggY2hlY2tcbmFwcC5nZXQoJy9oZWFsdGgnLCBhc3luYyAoKSA9PiAoeyBzdGF0dXM6ICdvaycsIHRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9KSk7XG5cbi8vIFN0YXJ0IHNlcnZlclxuY29uc3Qgc3RhcnQgPSBhc3luYyAoKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcG9ydCA9IHBhcnNlSW50KHByb2Nlc3MuZW52LlBPUlQgfHwgJzMwMDEnKTtcbiAgICBhd2FpdCBhcHAubGlzdGVuKHsgcG9ydCwgaG9zdDogJzAuMC4wLjAnIH0pO1xuICAgIGNvbnNvbGUubG9nKGBBUEkgcnVubmluZyBvbiBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH1gKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgYXBwLmxvZy5lcnJvcihlcnIpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufTtcblxuc3RhcnQoKTtcbiJdfQ==