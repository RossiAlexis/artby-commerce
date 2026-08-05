const NEON_API_BASE = "https://console.neon.tech/api/v2";

function apiKey() {
  const key = process.env.NEON_API_KEY;
  if (!key) throw new Error("NEON_API_KEY is not set");
  return key;
}

function projectId() {
  const id = process.env.NEON_PROJECT_ID;
  if (!id) throw new Error("NEON_PROJECT_ID is not set");
  return id;
}

async function neonApi(path: string, init?: RequestInit) {
  const res = await fetch(`${NEON_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Neon API ${path} failed (${res.status}): ${body}`);
  }
  return res.json();
}

export type TestBranch = {
  branchId: string;
  databaseUrl: string;
  directUrl: string;
};

export type NeonBranch = {
  id: string;
  name: string;
  createdAt: string;
};

/**
 * Lists every branch on the project, not just ephemeral test branches —
 * callers are responsible for filtering to the ones they care about.
 */
export async function listBranches(): Promise<NeonBranch[]> {
  const result = await neonApi(`/projects/${projectId()}/branches`);
  return result.branches.map(
    (branch: { id: string; name: string; created_at: string }) => ({
      id: branch.id,
      name: branch.name,
      createdAt: branch.created_at,
    }),
  );
}

/**
 * Creates an ephemeral branch (named per Neon's test-branch convention) off the
 * project's default branch, for the lifetime of one test run.
 */
export async function createTestBranch(): Promise<TestBranch> {
  const runTag = `${process.env.GITHUB_SHA ?? "local"}-${process.pid}-${Date.now()}`;
  const branchName = `test/run-${runTag}`;

  const created = await neonApi(`/projects/${projectId()}/branches`, {
    method: "POST",
    body: JSON.stringify({
      branch: { name: branchName },
      endpoints: [{ type: "read_write" }],
    }),
  });

  const branchId: string = created.branch.id;
  const uri = created.connection_uris?.[0];
  if (!uri) {
    throw new Error("Neon branch creation did not return a connection URI");
  }

  const directUrl: string = uri.connection_uri;
  const databaseUrl: string = directUrl.replace(
    uri.connection_parameters.host,
    uri.connection_parameters.pooler_host,
  );

  return { branchId, databaseUrl, directUrl };
}

export async function deleteTestBranch(branchId: string): Promise<void> {
  await neonApi(`/projects/${projectId()}/branches/${branchId}`, {
    method: "DELETE",
  });
}
