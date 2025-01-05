function toTitleCase(input: string): string {
  // Step 1: Replace underscores and hyphens with spaces
  let result = input.replace(/[_-]/g, " ");

  // Step 2: Insert spaces before uppercase letters (for camelCase and PascalCase)
  result = result.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Step 3: Convert the entire string to lowercase
  result = result.toLowerCase();

  // Step 4: Capitalize the first letter of each word
  result = result.replace(/\b\w/g, (char) => char.toUpperCase());

  return result;
}

export { toTitleCase };
