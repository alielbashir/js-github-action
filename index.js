const core = require("@actions/core");
const { NotionAPI } = require("notion-client");

async function run() {
  const databaseId = core.getInput("notion_database_id");
  const authToken = core.getInput("notion_auth_token");
  const newStatus = core.getInput("notion_status");
  const branch = core.getInput("branch");

  // Get first 2 parts of branch name
  const branchPrefix = branch.split("-").slice(0, 2).join("-");

  try {
    // Create a new Notion API client
    const notion = new NotionAPI(authToken);

    // Find the task with corresponding branch id
    const tasks = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Branch Prefix",
        formula: { string: { contains: branchPrefix } },
      },
    });

    if (tasks.results.length === 0) {
      core.setFailed(`No task found for branch ${branchPrefix}`);
      return;
    }

    const task = tasks.results[0];

    const oldStatus = task.properties.Status.status.name;

    core.debug(
      `Found task, updating status from ${oldStatus} to ${newStatus}...`
    );

    // Update the task's status
    await notion.pages.update({
      page_id: entry.id,
      properties: { Status: { status: { name: newStatus } } },
    });

    core.debug(`Updated task's status from ${oldStatus} to ${newStatus}!`);
  } catch (error) {
    core.setFailed(error.message);
    return;
  }
}

run();
