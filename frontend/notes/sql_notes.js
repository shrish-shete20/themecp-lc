// select
// insert 
// update 
// delete

const [rows, fields] = await db.query(sql, params);
// rows → actual result / metadata
// fields → column info (mostly useful for SELECT)


// 1. SELECT query -------------------------------------------
const [rows1, fields1] = await db.query("SELECT * FROM users");

// rows looks like:
[
  { id: 1, nickname: "utkarsh", email: "abc@gmail.com" },
  { id: 2, nickname: "john", email: "john@gmail.com" }
]
// fields looks like:
[
  { name: 'id', type: 3, ... },
  { name: 'nickname', type: 253, ... },
  { name: 'email', type: 253, ... }
]


// 2. INSERT query -----------------------------------------
const [rows2, fields2] = await db.query(sql, [sub, nickname, email]);
// rows looks like:
{
  fieldCount: 0,
  affectedRows: 1,
  insertId: 5,
  warningStatus: 0
}
// fields
undefined (or empty)


// 3. update -----------------------------------------------
let sql_ = "UPDATE users SET nickname = 'new' WHERE id = 1"
// rows
{
  fieldCount: 0,
  affectedRows: 1,
  changedRows: 1,
  warningStatus: 0
}
// fields are not important

// 4. Delete -----------------------------------------------------
sql_ = "DELETE FROM users WHERE sub = ?"
// rows
{
  fieldCount: 0,
  affectedRows: 1,
  warningStatus: 0
}
// fields are not important