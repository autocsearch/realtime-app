import { db } from "@/lib/db";

export default async function Dashboard() {
  await db.set("permission", 12);

  return (
    <>
      <div>
        <h1>hello World</h1>
      </div>
    </>
  );
}
