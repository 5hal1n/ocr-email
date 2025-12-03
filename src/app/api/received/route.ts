export const POST = async (request: Request) => {
    const data = await request.json()
    console.log(data)
    return new Response('Email Hook POST endpoint is working');
}