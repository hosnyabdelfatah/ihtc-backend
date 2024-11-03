module.exports =  (obj, ...keys) => {
    const userRequest = {}
    for (const [key, value] of Object.entries(obj)) {
        if (keys.includes(key)) {
            userRequest[key] = value;
        }
    }
    return userRequest;
}
