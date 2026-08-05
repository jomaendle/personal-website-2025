type EnvVar = {
  name: string;
  required: boolean;
  defaultValue?: string;
  validate?: (value: string) => boolean;
};

const serverEnvVars: EnvVar[] = [
  {
    name: "RESEND_API_KEY",
    required: true,
    validate: (value) => value.startsWith("re_"),
  },
  {
    name: "RESEND_AUDIENCE_ID",
    required: true,
    validate: (value) => value.length > 10,
  },
  {
    // Dedicated HMAC signing key for unsubscribe tokens. Required — there is
    // intentionally no fallback (see lib/unsubscribe-token.ts). Must be set in
    // the deployment environment or newsletter subscribe/unsubscribe will fail.
    name: "UNSUBSCRIBE_TOKEN_SECRET",
    required: true,
    validate: (value) => value.length >= 16,
  },
];

const clientEnvVars: EnvVar[] = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    validate: (value) => value.startsWith("https://"),
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    validate: (value) => value.length > 50,
  },
];

// Not exported: the only caller is the module-load check at the bottom of this
// file, which runs on the server whenever anything imports `getEnvVar`.
function validateEnvVars(isServer: boolean = typeof window === "undefined") {
  const varsToCheck = isServer
    ? [...serverEnvVars, ...clientEnvVars]
    : clientEnvVars;
  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  for (const envVar of varsToCheck) {
    const value = process.env[envVar.name];

    if (!value) {
      if (envVar.required && !envVar.defaultValue) {
        missingVars.push(envVar.name);
      }
      continue;
    }

    if (envVar.validate && !envVar.validate(value)) {
      invalidVars.push(envVar.name);
    }
  }

  if (missingVars.length > 0 || invalidVars.length > 0) {
    const errorMessages = [];

    if (missingVars.length > 0) {
      errorMessages.push(
        `Missing required environment variables: ${missingVars.join(", ")}`,
      );
    }

    if (invalidVars.length > 0) {
      errorMessages.push(
        `Invalid environment variables: ${invalidVars.join(", ")}`,
      );
    }

    throw new Error(errorMessages.join("\n"));
  }
}

export function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name];

  if (!value && required) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }

  return value || "";
}

// Validate on module import for server-side
if (typeof window === "undefined") {
  try {
    validateEnvVars(true);
  } catch (error) {
    console.error("Environment validation failed:", error);
    // Don't throw in production to prevent app crashes
    if (process.env.NODE_ENV === "development") {
      throw error;
    }
  }
}
