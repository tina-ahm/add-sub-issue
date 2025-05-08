import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/core";

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const myToken = core.getInput("myToken");
  const assignee = core.getInput("assignee");
  const issueNumber = Number(core.getInput("issue_number"));
  const templates = JSON.parse(core.getInput("templates"));

  const octokit = new Octokit({
    auth: myToken,
  });
  const context = github.context;

  for (const template of templates) {
    let body = "";

    try {
      const response = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        {
          owner: context.repo.owner,
          repo: context.repo.repo,
          path: template,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );

      const data = response.data;
      if (!Array.isArray(data) && data.type === "file") {
        const bufferArray = Buffer.from(data.content, "base64");
        body = bufferArray.toString("utf8");
      }
    } catch (error) {
      core.error(`Error encountered retrieving issue template: ${error}`);
    }

    core.debug(`template: ${body}`);

    const yamlAttributes = body.split("---")[1];
    const startIndex = yamlAttributes.indexOf("title");
    const endIndex = yamlAttributes.indexOf("label");
    const title = yamlAttributes
      .slice(startIndex, endIndex)
      .replace("title: ", "");
    body = body.split("---")[2];

    const newIssue = await octokit.request(
      "POST /repos/{owner}/{repo}/issues",
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: title,
        body: body,
        assignees: [assignee],
        type: "Task",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues",
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        sub_issue_id: newIssue.data.id,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
  }
}
