function getActiveUsers(users) {
  let results = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].active == true) {
      results.push(users[i]);
    }
  }
  return results;
}
