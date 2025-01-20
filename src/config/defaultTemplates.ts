export const defaultTemplates = [
  {
    name: "Bug Report",
    description: "Report a software bug or issue",
    details: "Use this template to report bugs with detailed steps to reproduce",
    templateStructure: [
      {
        sectionTitle: "Description",
        content: "Describe the bug and its impact. Be thorough and include all relevant details."
      },
      {
        sectionTitle: "Steps to Reproduce",
        content: "List the steps to reproduce the issue"
      },
      {
        sectionTitle: "Expected Behavior",
        content: "What should happen?"
      }
    ],
    icon: "bug",
    color: "text-red-500",
    tier: 1
  },
  {
    name: "User Story",
    description: "Suggest a new feature or enhancement",
    details: "Use this template to propose new features",
    templateStructure: [
      {
        sectionTitle: "User Story Goal",
        content: "State the goal of the user story with the format:As a [role], I want [feature] so that [benefit]."
      },
      {
        sectionTitle: "Description",
        content: "Describe the feature in detail. What is expected to be achieved, and how it will be achieved."
      },
      {
        sectionTitle: "Use Case",
        content: "Give an example of how this would be used"
      },
      {
        sectionTitle: "Acceptance Criteria",
        content: "What are the criteria for this user story to be considered complete? List them out."
      }
    ],
    icon: "user-story",
    color: "text-green-500",
    tier: 2
  },
  {
    name: "Task",
    description: "Create a general task or to-do item",
    details: "Use this template for general tasks and todos",
    templateStructure: [
      {
        sectionTitle: "Description",
        content: "What needs to be done?"
      },
      {
        sectionTitle: "Acceptance Criteria",
        content: "What are the requirements?"
      }
    ],
    icon: "task",
    color: "text-blue-500",
    tier: 3
  }
]; 