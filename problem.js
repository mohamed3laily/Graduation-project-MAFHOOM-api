const sanitizeInput = (text) => {
  // Regular expression to match all punctuations except underscores (_) and hyphens (-)
  const regex = /[^_\-\w\s]|(--+)/g; // Match single hyphen and two or more consecutive hyphens
  return text
    .replace(regex, (match, group) => (group ? "-" : "")) // Replace consecutive hyphens with a single hyphen
    .replace(/-(?=\s|$)/g, " ") // Replace hyphen followed by space or end with space
    .trim();
};

const findCombinationsFromText = (text) => {
  text = text.replace(/^-+|-+$/g, "");

  const words = text.split(
    /(?=Group_|Category_|Subcategory_|Make_|Model_|Diagram_)/
  );

  const tags = {
    Groups: null,
    Categories: null,
    Subcategories: null,
    Makes: null,
    Models: null,
    Diagrams: null,
  };

  let isValidPrefix = true; // Flag to track if all prefixes are valid

  for (let i = 0; i < words.length; i++) {
    let sentence = sanitizeInput(words[i]);

    // Remove consecutive hyphens while ensuring at most one hyphen remains
    while (sentence.includes("--")) {
      sentence = sentence.replace(/--/g, "-");
    }

    const validPrefixes = [
      "Group_",
      "Category_",
      "Subcategory_",
      "Make_",
      "Model_",
      "Diagram_",
    ];

    // Check if the sentence has a valid prefix
    const isAnyValidPrefix = validPrefixes.some((prefix) =>
      sentence.startsWith(prefix)
    );

    // If none of the valid prefixes are found, set isValidPrefix to false
    if (!isAnyValidPrefix) {
      isValidPrefix = false;
      break;
    }

    if (sentence.startsWith("Group_")) {
      if (tags.Groups) return [];
      tags.Groups = sentence;
    } else if (sentence.startsWith("Category_")) {
      if (tags.Categories) return [];
      tags.Categories = sentence;
    } else if (sentence.startsWith("Subcategory_")) {
      if (tags.Subcategories) return [];
      tags.Subcategories = sentence;
    } else if (sentence.startsWith("Make_")) {
      if (tags.Makes) return [];
      tags.Makes = sentence;
    } else if (sentence.startsWith("Model_")) {
      if (tags.Models) return [];
      tags.Models = sentence;
    } else if (sentence.startsWith("Diagram_")) {
      if (tags.Diagrams) return [];
      tags.Diagrams = sentence;
    }
  }

  // If any invalid prefix is found, return an empty array
  if (!isValidPrefix) {
    return [];
  }

  // Concatenate arrays in desired order
  const result = [];
  for (const key in tags) {
    if (tags[key]) {
      result.push(tags[key]);
    }
  }

  // Generate array of arrays
  const theWhole = [];
  while (result.length > 0) {
    theWhole.push(result.slice());
    result.pop();
  }

  return theWhole;
};

console.log(findCombinationsFromText(""));
