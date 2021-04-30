const typedAs = require("@allnulled/typed-as");
const { checkTypes } = typedAs;

class AbstractDatabaseIO {

	static create(...args) {
		return new this(...args);
	}

	constructor() {
		// @NOTHING HERE
	}

	async defineSchema() {
		throw new Error("Method <defineSchema> must be overriden by an adapter of AbstractDatabaseIO interface");
	}

	async defineModel() {
		throw new Error("Method <defineModel> must be overriden by an adapter of AbstractDatabaseIO interface");
	}

	async select() {
		throw new Error("Method <select> must be overriden by an adapter of AbstractDatabaseIO interface");
	}

	async insert() {
		throw new Error("Method <insert> must be overriden by an adapter of AbstractDatabaseIO interface");
	}

	async update() {
		throw new Error("Method <update> must be overriden by an adapter of AbstractDatabaseIO interface");
	}

	async delete() {
		throw new Error("Method <delete> must be overriden by an adapter of AbstractDatabaseIO interface");
	}

}

class BasicDatabaseIO extends AbstractDatabaseIO {

	constructor(...args) {
		super(...args);
		this.schema = {};
		this.data = {};
	}

	async defineSchema(structures = {}) {
		if(typeof structures !== "object") {
			throw new Error(`Required argument <structures> to be an object instead of ${typeof structures}`);
		}
		if(Array.isArray(structures)) {
			throw new Error(`Required argument <structures> to be an object instead of an array`);
		}
		const newModels = Object.keys(structures);
		for(let indexModels=0; indexModels < newModels.length; indexModels++) {
			const newModel = newModels[indexModels];
			if(newModel in this.schema) {
				throw new Error(`Model <${newModel}> already exists. To override specific models, use the method <model> instead of <schema>`);
			}
			const structure = structures[newModel];
			if(typeof structure !== "string") {
				throw new Error(`Required argument <structures[${newModel}]> to be a string`);
			}
			this.schema[newModel] = structure.replace(/^[\n\t\r ]*|[;\n\t\r ]*$/g, "");
			if(!(newModel in this.data)) {
				this.data[newModel] = [];
			}
		}
		return this.schema;
	}

	async defineModel(model, structure) {
		if(typeof model !== "string") {
			throw new Error(`Required argument <model> to be a string`);
		}
		if(typeof structure !== "string") {
			throw new Error(`Required argument <structure> to be a string`);
		}
		this.schema[model] = structure.replace(/^[\n\t\r ]*|[;\n\t\r ]*$/g, "");
		if(!(model in this.data)) {
			this.data[model] = [];
		}
	}

	async insert(model, data_) {
		if(!(model in this.schema)) {
			throw new Error("Required argument <model> to exist in <db.schema> before <insert>");
		}
		const data = [].concat(data_);
		// @VALIDATIONS:
		const validator = this.schema[model];
		for(let indexData=0; indexData < data.length; indexData++) {
			const dataItem = data[indexData];
			if(typeof dataItem !== "object") {
				throw new Error(`Required all <insert> items to be objects, but data item <${indexData}> is of type <${typeof dataItem}> instead.`);
			}
			const isValid = checkTypes(dataItem, validator, true);
			if(isValid !== true) {
				throw new Error(`Validation error on <insert> operation; data item <${indexData}>; property <${isValid.property}>; expression <${isValid.expression}>; target value <${isValid.target}>. Please, all <insert> items must be valid objects.`);
			}
		}
		// @INSERTIONS:
		const originalLength = this.data[model].length;
		for(let indexData=0; indexData < data.length; indexData++) {
			const dataItem = data[indexData];
			this.data[model].push(dataItem);
		}
		const finalLength = this.data[model].length;
		return [originalLength, finalLength];
	}

	async select(model, filters_) {
		if(!(model in this.schema)) {
			throw new Error("Required argument <model> to exist in <db.schema> before <select>");
		}
		const filters = [].concat(filters_);
		return this.data[model].filter(item => {
			let isSelected = true;
			for(let indexFilter=0; indexFilter < filters.length; indexFilter++) {
				const filter = filters[indexFilter];
				isSelected &= filter(item, this);
				if(!isSelected) {
					return false;
				}
			}
			return isSelected;
		});
	}

	async update(model, filters_, data) {
		if(!(model in this.data)) {
			throw new Error("Required argument <model> to exist in <db.data> before <update>");
		}
		const filters = [].concat(filters_);
		const modelData = this.data[model];
		const modifiedIndexes = [];
		for(let indexData=0; indexData < modelData.length; indexData++) {
			const item = modelData[indexData];
			let isSelected = true;
			for(let indexFilters=0; indexFilters < filters.length; indexFilters++) {
				const filter = filters[indexFilters];
				isSelected &= filter(item, this);
			}
			if(isSelected) {
				modifiedIndexes.push(indexData);
			}
		}
		for(let indexModifieds=0; indexModifieds < modifiedIndexes.length; indexModifieds++) {
			const modifiedIndex = modifiedIndexes[indexModifieds];
			this.data[model][modifiedIndex] = data;
		}
		return modifiedIndexes;
	}

	async delete(model, filters_) {
		if(!(model in this.data)) {
			throw new Error("Required argument <model> to exist in <db.data> before <delete>");
		}
		const filters = [].concat(filters_);
		const modelData = this.data[model];
		const deletedIndexes = [];
		for(let indexData=0; indexData < modelData.length; indexData++) {
			const item = modelData[indexData];
			let isSelected = true;
			for(let indexFilters=0; indexFilters < filters.length; indexFilters++) {
				const filter = filters[indexFilters];
				isSelected &= filter(item, this);
			}
			if(isSelected) {
				deletedIndexes.push(indexData);
			}
		}
		const reversedDeletedIndexes = deletedIndexes.reverse();
		for(let indexDeletes=0; indexDeletes < reversedDeletedIndexes.length; indexDeletes++) {
			const deletedIndex = reversedDeletedIndexes[indexDeletes];
			this.data[model].splice(deletedIndex);
		}
		return deletedIndexes;
	}

}

module.exports = { AbstractDatabaseIO, BasicDatabaseIO, typedAs };