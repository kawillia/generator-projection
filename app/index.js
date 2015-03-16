var generators = require('yeoman-generator');

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
    this.option('coffee'); // This method adds support for a `--coffee` flag
  },
  
  prompting: function () {
    var done = this.async();
	this.properties = [];
	
    var prompts = [
    {
        name: 'projectionName',
        message: 'What is your Projection\'s name?'
    },
    {
        name: 'namespace',
        message: 'What is your Projection\'s namespace?'
    }];

    var addPropertyConfirmPrompt = [
    {
        name: 'addProperty',
        message: 'Would you like to add a property?',
        type: 'confirm'
    }];

    var addPropertyPrompts = [
    {
        name: 'propertyName',
        message: 'What is your property\'s name?',
    },
    {
        type: 'list',
        name: 'propertyType',
        message: 'What type is your property?',
        choices: ['Int32', 'String', 'Boolean']
    },
    {
        type: 'list',
        name: 'propertyAccessModifier',
        message: 'What is the access modifier of this property?',
        choices: ['public', 'private']
    }];
		
    this.prompt(prompts, function (props) {
        this.projectionName = props.projectionName;
        this.namespace = props.namespace;

        var askForProperty = function() {
            this.prompt(addPropertyConfirmPrompt, function(response) {
                if (response.addProperty) {
                    this.prompt(addPropertyPrompts, function(addPropertyResponse) {
                        var property = 
                        { 
                            name: addPropertyResponse.propertyName, 
                            type: addPropertyResponse.propertyType, 
                            accessModifier: addPropertyResponse.propertyAccessModifier 
                        }

                        this.properties.push(property);
                        askForProperty();
                    }.bind(this)); 
                }
                else {
                    done();
                }
            }.bind(this));
        }.bind(this);

        askForProperty();
    }.bind(this));
  },
  
  writing: function () {
    var propertiesString = '';

    this.properties.forEach(function(element, index, array) {
        if (index > 0) 
            propertiesString += '\r\n        ';

        propertiesString += element.accessModifier + ' ' + element.type + ' ' + element.name + ' { get; set; }';
    });

    this.fs.copyTpl(
        this.templatePath('Projection.cs'),
        this.destinationPath('public/' + this.projectionName + 'Projection.cs'),
        { 
            classTitle: this.projectionName, 
            namespace: this.namespace, 
            propertiesString: propertiesString 
        }
    );
  }
});