import { graphql } from '@octokit/graphql';
import { setFailed } from '@actions/core';
import { context } from '@actions/github';

const token = process.env.GITHUB_TOKEN;
const owner = context.repo.owner;
const repo = context.repo.repo;

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${token}`
  }
});

const projectNumber = 1; // Replace with your project number
const projectFields = {
  Priority: 'PriorityFieldID', // Replace with your field IDs
  Severity: 'SeverityFieldID',
  Likelihood: 'LikelihoodFieldID',
  Classification: 'ClassificationFieldID'
};

async function getProjectItems() {
  const query = `
    query($owner: String!, $repo: String!, $projectNumber: Int!) {
      repository(owner: $owner, name: $repo) {
        projectV2(number: $projectNumber) {
          items(first: 100) {
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
                  ... on ProjectV2ItemFieldTextValue {
                    field {
                      id
                      name
                    }
                    text
                  }
                  ... on ProjectV2ItemFieldNumberValue {
                    field {
                      id
                      name
                    }
                    number
                  }
                  ... on ProjectV2ItemFieldDateValue {
                    field {
                      id
                      name
                    }
                    date
                  }
                  ... on ProjectV2ItemFieldIterationValue {
                    field {
                      id
                      name
                    }
                    title
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

async function run() {
  try {
    const projectItems = await getProjectItems();

    for (const item of projectItems) {
      const fields = {};
      let currentClassification = null;
      for (const field of item.fieldValues.nodes) {
        if (field.__typename === 'ProjectV2ItemFieldSingleSelectValue') {
          console.log(`Field: ${field.field.name}, Value: ${field.name}`); // Debugging output
          fields[field.field.name] = field.name;
        } else if (field.__typename === 'ProjectV2ItemFieldTextValue') {
          console.log(`Field: ${field.field.name}, Value: ${field.text}`); // Debugging output
          fields[field.field.name] = field.text;
        } else if (field.__typename === 'ProjectV2ItemFieldNumberValue') {
          console.log(`Field: ${field.field.name}, Value: ${field.number}`); // Debugging output
          fields[field.field.name] = field.number;
        } else if (field.__typename === 'ProjectV2ItemFieldDateValue') {
          console.log(`Field: ${field.field.name}, Value: ${field.date}`); // Debugging output
          fields[field.field.name] = field.date;
        } else if (field.__typename === 'ProjectV2ItemFieldIterationValue') {
          console.log(`Field: ${field.field.name}, Value: ${field.title}`); // Debugging output
          fields[field.field.name] = field.title;
        }
        if (field.field.id === projectFields.Classification) {
          currentClassification = field.name || field.text || field.number || field.date || field.title;
        }
      }

      const itemId = item.id;
      const priority = parseInt(fields.Priority, 10);
      const severity = parseInt(fields.Severity, 10);
      const likelihood = parseInt(fields.Likelihood, 10);

      const newClassification = calculateClassification(priority, severity, likelihood);

      if (newClassification !== currentClassification) {
        console.log(`Updating Classification for item ${itemId}: ${newClassification}`); // Debugging output
        await updateClassification(itemId, newClassification);
      } else {
        console.log(`Classification for item ${itemId} is up-to-date: ${newClassification}`); // Debugging output
      }
    }
  } catch (error) {
    console.error(error);
    setFailed(error.message);
  }
}

run();
