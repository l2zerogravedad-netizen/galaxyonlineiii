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
const fleets_1 = require("./routes/fleets");
const missions_1 = require("./routes/missions");
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
app.register(fleets_1.fleetRoutes, { prefix: '/api/fleets' });
app.register(missions_1.missionRoutes, { prefix: '/api/missions' });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBOEI7QUFDOUIseURBQWlDO0FBQ2pDLHVEQUErQjtBQUUvQix3Q0FBMkM7QUFDM0MsNENBQStDO0FBQy9DLDRDQUErQztBQUMvQyxnREFBbUQ7QUFDbkQsZ0RBQW1EO0FBQ25ELDRDQUE4QztBQUM5QyxnREFBa0Q7QUFFbEQsTUFBTSxHQUFHLEdBQUcsSUFBQSxpQkFBTyxFQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFFdEMsVUFBVTtBQUNWLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDckMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksaUNBQWlDLEVBQUUsQ0FBQyxDQUFDO0FBRTNGLFNBQVM7QUFDVCxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUNsRCxHQUFHLENBQUMsUUFBUSxDQUFDLHFCQUFZLEVBQUUsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztBQUN0RCxHQUFHLENBQUMsUUFBUSxDQUFDLHFCQUFZLEVBQUUsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztBQUN2RCxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUFjLEVBQUUsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQztBQUMxRCxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUFjLEVBQUUsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQztBQUMxRCxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFXLEVBQUUsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztBQUNyRCxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUFhLEVBQUUsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQztBQUV6RCxlQUFlO0FBQ2YsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUVuRixlQUFlO0FBQ2YsTUFBTSxLQUFLLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDdkIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmFzdGlmeSBmcm9tICdmYXN0aWZ5JztcbmltcG9ydCBjb3JzIGZyb20gJ0BmYXN0aWZ5L2NvcnMnO1xuaW1wb3J0IGp3dCBmcm9tICdAZmFzdGlmeS9qd3QnO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSAnQGdhbGF4eS9kYXRhYmFzZSc7XG5pbXBvcnQgeyBhdXRoUm91dGVzIH0gZnJvbSAnLi9yb3V0ZXMvYXV0aCc7XG5pbXBvcnQgeyBlbXBpcmVSb3V0ZXMgfSBmcm9tICcuL3JvdXRlcy9lbXBpcmUnO1xuaW1wb3J0IHsgcGxhbmV0Um91dGVzIH0gZnJvbSAnLi9yb3V0ZXMvcGxhbmV0JztcbmltcG9ydCB7IHJlc2VhcmNoUm91dGVzIH0gZnJvbSAnLi9yb3V0ZXMvcmVzZWFyY2gnO1xuaW1wb3J0IHsgc2hpcHlhcmRSb3V0ZXMgfSBmcm9tICcuL3JvdXRlcy9zaGlweWFyZCc7XG5pbXBvcnQgeyBmbGVldFJvdXRlcyB9IGZyb20gJy4vcm91dGVzL2ZsZWV0cyc7XG5pbXBvcnQgeyBtaXNzaW9uUm91dGVzIH0gZnJvbSAnLi9yb3V0ZXMvbWlzc2lvbnMnO1xuXG5jb25zdCBhcHAgPSBmYXN0aWZ5KHsgbG9nZ2VyOiB0cnVlIH0pO1xuXG4vLyBQbHVnaW5zXG5hcHAucmVnaXN0ZXIoY29ycywgeyBvcmlnaW46IHRydWUgfSk7XG5hcHAucmVnaXN0ZXIoand0LCB7IHNlY3JldDogcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCB8fCAnZGV2LXNlY3JldC1jaGFuZ2UtaW4tcHJvZHVjdGlvbicgfSk7XG5cbi8vIFJvdXRlc1xuYXBwLnJlZ2lzdGVyKGF1dGhSb3V0ZXMsIHsgcHJlZml4OiAnL2FwaS9hdXRoJyB9KTtcbmFwcC5yZWdpc3RlcihlbXBpcmVSb3V0ZXMsIHsgcHJlZml4OiAnL2FwaS9lbXBpcmUnIH0pO1xuYXBwLnJlZ2lzdGVyKHBsYW5ldFJvdXRlcywgeyBwcmVmaXg6ICcvYXBpL3BsYW5ldHMnIH0pO1xuYXBwLnJlZ2lzdGVyKHJlc2VhcmNoUm91dGVzLCB7IHByZWZpeDogJy9hcGkvcmVzZWFyY2gnIH0pO1xuYXBwLnJlZ2lzdGVyKHNoaXB5YXJkUm91dGVzLCB7IHByZWZpeDogJy9hcGkvc2hpcHlhcmQnIH0pO1xuYXBwLnJlZ2lzdGVyKGZsZWV0Um91dGVzLCB7IHByZWZpeDogJy9hcGkvZmxlZXRzJyB9KTtcbmFwcC5yZWdpc3RlcihtaXNzaW9uUm91dGVzLCB7IHByZWZpeDogJy9hcGkvbWlzc2lvbnMnIH0pO1xuXG4vLyBIZWFsdGggY2hlY2tcbmFwcC5nZXQoJy9oZWFsdGgnLCBhc3luYyAoKSA9PiAoeyBzdGF0dXM6ICdvaycsIHRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9KSk7XG5cbi8vIFN0YXJ0IHNlcnZlclxuY29uc3Qgc3RhcnQgPSBhc3luYyAoKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcG9ydCA9IHBhcnNlSW50KHByb2Nlc3MuZW52LlBPUlQgfHwgJzMwMDEnKTtcbiAgICBhd2FpdCBhcHAubGlzdGVuKHsgcG9ydCwgaG9zdDogJzAuMC4wLjAnIH0pO1xuICAgIGNvbnNvbGUubG9nKGBBUEkgcnVubmluZyBvbiBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH1gKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgYXBwLmxvZy5lcnJvcihlcnIpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufTtcblxuc3RhcnQoKTtcbiJdfQ==