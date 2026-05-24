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
const game_1 = require("./routes/game");
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
app.register(game_1.gameRoutes, { prefix: '/api/game' });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBOEI7QUFDOUIseURBQWlDO0FBQ2pDLHVEQUErQjtBQUUvQix3Q0FBMkM7QUFDM0MsNENBQStDO0FBQy9DLDRDQUErQztBQUMvQyxnREFBbUQ7QUFDbkQsZ0RBQW1EO0FBQ25ELDRDQUE4QztBQUM5QyxnREFBa0Q7QUFDbEQsd0NBQTJDO0FBRTNDLE1BQU0sR0FBRyxHQUFHLElBQUEsaUJBQU8sRUFBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBRXRDLFVBQVU7QUFDVixHQUFHLENBQUMsUUFBUSxDQUFDLGNBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLGlDQUFpQyxFQUFFLENBQUMsQ0FBQztBQUUzRixTQUFTO0FBQ1QsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDbEQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBWSxFQUFFLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDdEQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBWSxFQUFFLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDdkQsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBYyxFQUFFLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7QUFDMUQsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBYyxFQUFFLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7QUFDMUQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBVyxFQUFFLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDckQsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBYSxFQUFFLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7QUFDekQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFFbEQsZUFBZTtBQUNmLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFbkYsZUFBZTtBQUNmLE1BQU0sS0FBSyxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQ3ZCLElBQUksQ0FBQztRQUNILE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQztRQUNsRCxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztBQUNILENBQUMsQ0FBQztBQUVGLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZhc3RpZnkgZnJvbSAnZmFzdGlmeSc7XG5pbXBvcnQgY29ycyBmcm9tICdAZmFzdGlmeS9jb3JzJztcbmltcG9ydCBqd3QgZnJvbSAnQGZhc3RpZnkvand0JztcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0BnYWxheHkvZGF0YWJhc2UnO1xuaW1wb3J0IHsgYXV0aFJvdXRlcyB9IGZyb20gJy4vcm91dGVzL2F1dGgnO1xuaW1wb3J0IHsgZW1waXJlUm91dGVzIH0gZnJvbSAnLi9yb3V0ZXMvZW1waXJlJztcbmltcG9ydCB7IHBsYW5ldFJvdXRlcyB9IGZyb20gJy4vcm91dGVzL3BsYW5ldCc7XG5pbXBvcnQgeyByZXNlYXJjaFJvdXRlcyB9IGZyb20gJy4vcm91dGVzL3Jlc2VhcmNoJztcbmltcG9ydCB7IHNoaXB5YXJkUm91dGVzIH0gZnJvbSAnLi9yb3V0ZXMvc2hpcHlhcmQnO1xuaW1wb3J0IHsgZmxlZXRSb3V0ZXMgfSBmcm9tICcuL3JvdXRlcy9mbGVldHMnO1xuaW1wb3J0IHsgbWlzc2lvblJvdXRlcyB9IGZyb20gJy4vcm91dGVzL21pc3Npb25zJztcbmltcG9ydCB7IGdhbWVSb3V0ZXMgfSBmcm9tICcuL3JvdXRlcy9nYW1lJztcblxuY29uc3QgYXBwID0gZmFzdGlmeSh7IGxvZ2dlcjogdHJ1ZSB9KTtcblxuLy8gUGx1Z2luc1xuYXBwLnJlZ2lzdGVyKGNvcnMsIHsgb3JpZ2luOiB0cnVlIH0pO1xuYXBwLnJlZ2lzdGVyKGp3dCwgeyBzZWNyZXQ6IHByb2Nlc3MuZW52LkpXVF9TRUNSRVQgfHwgJ2Rldi1zZWNyZXQtY2hhbmdlLWluLXByb2R1Y3Rpb24nIH0pO1xuXG4vLyBSb3V0ZXNcbmFwcC5yZWdpc3RlcihhdXRoUm91dGVzLCB7IHByZWZpeDogJy9hcGkvYXV0aCcgfSk7XG5hcHAucmVnaXN0ZXIoZW1waXJlUm91dGVzLCB7IHByZWZpeDogJy9hcGkvZW1waXJlJyB9KTtcbmFwcC5yZWdpc3RlcihwbGFuZXRSb3V0ZXMsIHsgcHJlZml4OiAnL2FwaS9wbGFuZXRzJyB9KTtcbmFwcC5yZWdpc3RlcihyZXNlYXJjaFJvdXRlcywgeyBwcmVmaXg6ICcvYXBpL3Jlc2VhcmNoJyB9KTtcbmFwcC5yZWdpc3RlcihzaGlweWFyZFJvdXRlcywgeyBwcmVmaXg6ICcvYXBpL3NoaXB5YXJkJyB9KTtcbmFwcC5yZWdpc3RlcihmbGVldFJvdXRlcywgeyBwcmVmaXg6ICcvYXBpL2ZsZWV0cycgfSk7XG5hcHAucmVnaXN0ZXIobWlzc2lvblJvdXRlcywgeyBwcmVmaXg6ICcvYXBpL21pc3Npb25zJyB9KTtcbmFwcC5yZWdpc3RlcihnYW1lUm91dGVzLCB7IHByZWZpeDogJy9hcGkvZ2FtZScgfSk7XG5cbi8vIEhlYWx0aCBjaGVja1xuYXBwLmdldCgnL2hlYWx0aCcsIGFzeW5jICgpID0+ICh7IHN0YXR1czogJ29rJywgdGltZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH0pKTtcblxuLy8gU3RhcnQgc2VydmVyXG5jb25zdCBzdGFydCA9IGFzeW5jICgpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwb3J0ID0gcGFyc2VJbnQocHJvY2Vzcy5lbnYuUE9SVCB8fCAnMzAwMScpO1xuICAgIGF3YWl0IGFwcC5saXN0ZW4oeyBwb3J0LCBob3N0OiAnMC4wLjAuMCcgfSk7XG4gICAgY29uc29sZS5sb2coYEFQSSBydW5uaW5nIG9uIGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fWApO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBhcHAubG9nLmVycm9yKGVycik7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59O1xuXG5zdGFydCgpO1xuIl19