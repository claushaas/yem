export async function executeAndRepeat(targetPromise: () => Promise<any>, milliseconds: number) {
    if (process.env.NODE_ENV === 'test') {
        return await targetPromise()
    }

    const scheduleNextExecution = () => setTimeout(() => executeAndRepeat(targetPromise, milliseconds), milliseconds)

    try {
        const result = await targetPromise()
        scheduleNextExecution()
        return result
    } catch (error) {
        scheduleNextExecution()
        throw error
    }
}