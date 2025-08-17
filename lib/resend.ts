import { Resend } from "resend";
import { getEnvVar } from "./env-validation";

const RESEND_API_KEY = getEnvVar("RESEND_API_KEY");
const resend = new Resend(RESEND_API_KEY);

export default resend;
