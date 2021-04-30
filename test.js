async function TEST() {
	try {
		console.log("STARTING TEST 1: INCLUDE API")
		const api = require(__dirname + "/index.js");
		const { BasicDatabaseIO } = api;
		const db = BasicDatabaseIO.create();
		await db.defineSchema({
			recursos: `
				name:string
			`,
			procesos: `
				name:string;
				priority:integer;
			`,
		});
		console.log("STARTING TEST 2: INSERTION");
		await db.insert("recursos", [{
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
		console.log("STARTING TEST 2: SELECTION");
		const selection = await db.select("recursos", item => item.name === "Recurso 1");
		if((selection.length !== 1) || (selection[0].name !== "Recurso 1")) {
			throw new Error("SELECTION NOT WORKING");
		}
		console.log("STARTING TEST 3: UPDATION");
		const updation = await db.update("recursos", item => ["Recurso 1", "Recurso 2"].indexOf(item.name) !== -1, { name: "Recurso alterado" });
		if(updation.length !== 2) {
			throw new Error("UPDATION NOT WORKING (1)");
		}
		const selectionOfUpdation = await db.select("recursos", item => item.name === "Recurso alterado");
		if(selectionOfUpdation.length !== 2) {
			throw new Error("UPDATION NOT WORKING (2)");
		}
		console.log("STARTING TEST 4: DELETION");
		const deletion = await db.delete("recursos", item => ["Recurso alterado"].indexOf(item.name) !== -1);
		if(deletion.length !== 2) {
			throw new Error("DELETION NOT WORKING (1)");
		}
		const selectionOfDeletion = await db.select("recursos", item => item.name === "Recurso alterado");
		if(selectionOfDeletion.length !== 0) {
			throw new Error("DELETION NOT WORKING (2)");
		}
		console.log("OK: ALL TESTS PASSED SUCCESSFULLY!");
	} catch(error) {
		console.error("ERROR: TEST FAILED:", error);
	}
};

TEST()