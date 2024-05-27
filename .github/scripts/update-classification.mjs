import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import { setFailed } from '@actions/core';
import { context } from '@actions/github';

const MyOctokit = Octokit.plugin(restEndpointMethods);
const octokit = new MyOctokit({ auth: process.env.GITHUB_TOKEN });

const projectNumber = 2; // Replace with your project number
const projectFields = {
  Priority: 'PriorityFieldID', // Replace with your field IDs
  Severity: 'SeverityFieldID',
  Likelihood: 'LikelihoodFieldID',
  Classification: 'ClassificationFieldID'
};

async function getProjectItems(owner, repo, projectNumber) {
  const project = await octokit.rest.projects.listForRepo({
    owner,
    repo,
  });

  const projectId = project.data.find(proj => proj.number === projectNumber).id;

  const columns = await octokit.rest.projects.listColumns({
    project_id: projectId,
  });

  const items = [];
  for (const column of columns.data) {
    const columnItems = await octokit.rest.projects.listCards({
      column_id: column.id,
    });
    items.push(...columnItems.data);
  }

  return items;
}

async function getItemFields(itemId) {
  const response = await octokit.rest.projects.getCard({
    card_id: itemId,
  });

  return response.data;
}

async function updateClassification(itemId, classification) {
  await octokit.rest.projects.updateCard({
    card_id: itemId,
    note: classification,
  });
}

function calculateClassification(priority, severity, likelihood) {
  // Example classification logic
  return (priority * severity * likelihood).toString(); // Convert to string for mutation
}

async function run() {
  try {
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const projectItems = await getProjectItems(owner, repo, projectNumber);

    for (const item of projectItems) {
      const fields = {};
      const itemData = await getItemFields(item.id);
      const note = itemData.note;

      // Assuming fields are stored in a JSON format in the note
      const fieldData = JSON.parse(note);
      fields.Priority = fieldData.Priority;
      fields.Severity = fieldData.Severity;
      fields.Likelihood = fieldData.Likelihood;
      const currentClassification = fieldData.Classification;

      const priority = parseInt(fields.Priority, 10);
      const severity = parseInt(fields.Severity, 10);
      const likelihood = parseInt(fields.Likelihood, 10);

      const newClassification = calculateClassification(priority, severity, likelihood);

      if (newClassification !== currentClassification) {
        console.log(`Updating Classification for item ${item.id}: ${newClassification}`); // Debugging output
        await updateClassification(item.id, newClassification);
      } else {
        console.log(`Classification for item ${item.id} is up-to-date: ${newClassification}`); // Debugging output
      }
    }
  } catch (error) {
    console.error(error);
    setFailed(error.message);
  }
}

run();
