// oxlint-disable-next-line no-unused-vars
const USER_NAME = "johanneskonings";

// export const articles = await fetch(
// 	`https://dev.to/api/articles?username=${USER_NAME}`,
// 	{
// 		headers: {
// 			"api-key": process.env.API_KEY,
// 		},
// 	},
// );
// export const articles = await fetch(
// 	`https://dev.to/api/articles?username=${USER_NAME}`,
// );

const articleId = 2128767;
export const article = await fetch(`https://dev.to/api/articles/${articleId}`);

console.log(await article.json());
