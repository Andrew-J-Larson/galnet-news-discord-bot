// needed async functions that need to work like sync functions
function asyncGetOwnerUsername() {
    return (client, ownerId) => {
        // Your async code here
        return client.users.fetch(serverOwnerId);
    }
}

module.exports = asyncGetOwnerUsername