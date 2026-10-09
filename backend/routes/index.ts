// src/routes/index.ts
import { Router } from "express";
import loginRoute from "./auth/login.js";
import registerRoute from "./auth/register.js";
import meRoute from "./me.js";
import usersRoute from "./users.js";
import schoolRoute from "./school.js";
import classesRoute from "./classes.js";
import resourcesRoute from "./resources.js";
import dashboardRoute from "./dashboard.js";
import rolesRoute from "./roles.js";
import managementRoute from "./management.js";
import searchRoute from "./search.js";
import scopedDataRoute from "./scoped-data.js";

const router = Router();

router.use("/auth", loginRoute);
router.use("/auth", registerRoute);
router.use(meRoute);
router.use(usersRoute);
router.use(schoolRoute);
router.use(classesRoute);
router.use(resourcesRoute);
router.use(dashboardRoute);
router.use(rolesRoute);
router.use(managementRoute);
router.use(searchRoute);
router.use(scopedDataRoute);

export default router;