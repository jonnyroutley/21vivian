import { paths } from "../client/schema"

export async function getReviews() {
  const query = await fetch("http://localhost:3000/reviews");

  const json = await query.json();
  const okay = json as paths["/reviews"]["get"]["responses"]["201"]["content"]["application/json; charset=utf-8"]
  return okay
};