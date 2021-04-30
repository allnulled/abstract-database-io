# abstract-database-io

Simple database abstraction. With asynchronous interface and a basic database simulation with simple objects.

# Why?

This is an intermediate effort to create theorical demonstrations.

This project is quite useless compared to others out there for the same kind of tasks, so use it at your own risk, but I do not recommend it.

As a *simple and abstract programmatic interface for database communications*, though, it has sense to be used. But it means that you create a new interface by your own, your own **adapters** to work with well-maintained databases.

Do not use the default adapter (`BasicDatabaseIO`), unless to create local databases for graphical user applications (like `vue`, `react`, `angular` and so on) that do not need to handle large datasets or well-validated data. This adapter was made only for simple demonstrations, not big projects.

I created this to have a decent interface to integrate in `vue` projects, this was the main purpose of this library.

# API

You have 2 interfaces:

 - `AbstractDatabaseIO`: made to wrap the basic database ops abstractly (they do not work, they throw errors instead).
 - `BasicDatabaseIO`: made for demos.
 Mainly, because the algorythms are not the best, and the `update` validation is not applying, only on `insert`.

In both, the interface is the same, but I am going to describe `BasicDatabaseIO`, which is the rude adapter I have described (and that I do not recommend to use):

  - `schema`: the structures of the database tables.
  - `data`: the data.
  - `defineSchema(structures)`: to define a whole set of models.
  - `defineModel(model, structure)`: to define a unique model.
  - `insert(model, data)`: to insert data (it carries validation).
  - `select(model, filters)`: to select data. `filters` are functions that filter the items.
  - `update(model, filters, data)`: to update data. `data` is the changed data (and it does not carry validation).
  - `delete(model, filters)`: to delete data.

That is it, mainly. Structures are objects whose keys refer to the schema tables and the values refer to the validation the objects inserted must follow (but not updated items, which can end in a buggy behaviour). To write this validations, you have to check the library [`@allnulled/typed-as`](https://www.npmjs.com/package/@allnulled/typed-as).

# Usage

## To create a database

```js
const db = BasicDatabaseIO.create();
```

## To define a schema

```js
await db.defineSchema({
	resources: `
		name:string
	`,
	processes: `
		name:string;
		priority:integer;
	`,
});
```
## To insert items

```js
await db.insert("resources", [{
	name: "Recurso 1"
}, {
	name: "Recurso 2"
}, {
	name: "Recurso 3"
}, {
	name: "Recurso 4"
}, {
	name: "Recurso 5"
}]);
```

## To select items

```js
await db.select("resources", item => item.name === "Recurso 1");
    // returns an array with the items selected
```

## To update items

```js
const updation = await db.update("resources", item => ["Recurso 1", "Recurso 2"].indexOf(item.name) !== -1, { name: "Recurso alterado" });
    // returns an array with the indexes updated
```

## To delete items

```js
const deletion = await db.delete("resources", item => ["Recurso alterado"].indexOf(item.name) !== -1);
    // returns an array with the indexes deleted
```

# Tests

To run the tests, just: `npm run test`

# License

No license, free, do what you want.