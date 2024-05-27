import { graphql } from '@octokit/graphql';
import { setFailed } from '@actions/core';
import { context } from '@actions/github';
import fs from 'fs';

const token = process.env.GITHUB_TOKEN;
const owner = context.repo.owner;
const repo = context.repo.repo;

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${token}`
  }
});

const projectNumber = 2; // Replace with your project number
const projectFields = {
  Priority: '112738966', // Replace with your field IDs
  Severity: 'SeverityFieldID',
  Likelihood: 'LikelihoodFieldID',
  Classification: '112739029'
};

const stateFilePath = './project-state.json';

async function getProjectItems() {
  const query = `
    query($owner: String!, $repo: String!, $projectNumber: Int!) {
      repository(owner: $owner, name: $repo) {
        projectV2(number: $projectNumber) {
          items(first: 500) {
            nodes {
              id
              fieldValues(first: 10) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    field {
                      id
                      name
                    }
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    owner,
    repo,
    projectNumber
  };

  const response = await graphqlWithAuth(query, variables);
  return response.repository.projectV2.items.nodes;
}

async function updateClassification(itemId, classification) {
  const mutation = `
    mutation($projectId: ID!, $fieldId: ID!, $itemId: ID!, $value: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId,
        fieldId: $fieldId,
        itemId: $itemId,
        value: {
          singleSelectOptionId: $value
        }
      }) {
        projectV2Item {
          id
        }
      }
    }
  `;

  const variables = {
    projectId: projectFields.Classification,
    fieldId: projectFields.Classification,
    itemId,
    value: classification
  };

  await graphqlWithAuth(mutation, variables);
}

function calculateClassification(priority, severity, likelihood) {
  // Example classification logic
  return (priority * severity * likelihood).toString(); // Convert to string for mutation
}

function loadState(filePath) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  }
  return {};
}

function saveState(state, filePath) {
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

async function run() {
  try {
    const projectItems = await getProjectItems();
    const previousState = loadState(stateFilePath);
    const currentState = {};

    for (const item of projectItems) {
      const fields = {};
      for (const field of item.fieldValues.nodes) {
        console.log(`Field: ${field.field.name}, Value: ${field.name}`); // Debugging output
        fields[field.field.name] = field.name;
      }

      const itemId = item.id;
      const priority = parseInt(fields.Priority, 10);
      const severity = parseInt(fields.Severity, 10);
      const likelihood = parseInt(fields.Likelihood, 10);

      currentState[itemId] = { priority, severity, likelihood };

      if (
        !previousState[itemId] ||
        previousState[itemId].priority !== priority ||
        previousState[itemId].severity !== severity ||
        previousState[itemId].likelihood !== likelihood
      ) {
        const classification = calculateClassification(priority, severity, likelihood);
        console.log(`Calculated Classification: ${classification}`); // Debugging output
        await updateClassification(itemId, classification);
      }
    }

    saveState(currentState, stateFilePath);
  } catch (error) {
    console.error(error);
    setFailed(error.message);
  }
}

run();
