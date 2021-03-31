// needed async functions that need to work like sync functions
function asyncGetOwnerUsername() {
    return (client, ownerId) => {
        // Your async code here
        console.log(client.users);
        return client.users.fetch(ownerId);
    }
}

module.exports = asyncGetOwnerUsername