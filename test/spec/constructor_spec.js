"use strict";

define(['lib/component'], function (defineComponent) {

  describe('(Core) constructor', function () {

    function testComponent() {
      this.testVal = 1066;
    }

    function testComponentDefaultAttrs() {
      this.defaultAttrs({core: 35});
    }

    function testComponentDefaultAttrsRequired() {
      this.defaultAttrs({req: null});
    }

    function withGoodDefaults() {
      this.defaultAttrs({extra: 38});
    }

    function withBadDefaults() {
      this.defaultAttrs({core: 38});
    }

    it('exports a define function', function () {
      expect(typeof defineComponent).toBe('function');
    });

    it('defineComponent() should return a component constructor', function () {
      var TestComponent = defineComponent(testComponent);

      expect(typeof TestComponent).toBe('function');
      expect(typeof TestComponent.attachTo).toBe('function');
      expect(TestComponent.prototype.testVal).toBe(1066);
    });

    it('has standard methods', function () {
      var TestComponent = defineComponent(testComponent);

      expect(typeof TestComponent.prototype.on).toBe('function');
      expect(typeof TestComponent.prototype.off).toBe('function');
      expect(typeof TestComponent.prototype.trigger).toBe('function');
    });

    it('can describe itself', function () {
      var TestComponent = defineComponent(testComponent, withGoodDefaults);
      expect(TestComponent.toString()).toBe('testComponent, withGoodDefaults');
    });

    it('adds core defaults', function () {
      var TestComponent = defineComponent(testComponentDefaultAttrs);
      var instance = (new TestComponent).initialize(document.body);

      expect(instance.attr.core).toBe(35);

      TestComponent.teardownAll();
    });

    it('throws error if required attr not specified', function () {
      var TestComponent = defineComponent(testComponentDefaultAttrsRequired);
      expect(function () {
        var instance = (new TestComponent).initialize(document.body);
      }).toThrow('Required attribute "req" not specified in attachTo for component "testComponentDefaultAttrsRequired".');

      TestComponent.teardownAll();
    });

    it("doesn't throw error if required attr is specified", function () {
      var TestComponent = defineComponent(testComponentDefaultAttrsRequired);
      expect(function () {
        var instance = (new TestComponent).initialize(document.body, { req: 'hello' });
      }).not.toThrow();

      TestComponent.teardownAll();
    });

    it("doesn't attach to empty jQuery objects", function () {
      var TestComponent = defineComponent(testComponentDefaultAttrs);
      var trouble = function () {
        (new TestComponent).initialize();
      };
      expect(trouble).toThrow(new Error("Component needs a node"));
    });

    it('adds mixin defaults', function () {
      var TestComponent = defineComponent(testComponent, withGoodDefaults);
      var instance = (new TestComponent).initialize(document.body);

      expect(instance.attr.extra).toBe(38);

      TestComponent.teardownAll();
    });

    it('adds core and mixin defaults', function () {
      var TestComponent = defineComponent(testComponentDefaultAttrs, withGoodDefaults);
      var instance = (new TestComponent).initialize(document.body);
      expect(instance.attr.core).toBe(35);
      expect(instance.attr.extra).toBe(38);

      TestComponent.teardownAll();
    });

    it('throws error when core and mixin defaults overlap', function () {
      expect(function () {
        defineComponent(testComponentDefaultAttrs, withBadDefaults);
      }).toThrow('utils.push attempted to overwrite "core" while running in protected mode');
    });

    describe('teardownAll', function () {

      it('should teardown all instances', function () {
        var TestComponent = defineComponent(testComponent);
        var instance1 = (new TestComponent).initialize(document.body)
        var instance2 = (new TestComponent).initialize(document.body);
        spyOn(instance1, 'teardown').andCallThrough();
        spyOn(instance2, 'teardown').andCallThrough();
        TestComponent.teardownAll();
        expect(instance1.teardown).toHaveBeenCalled();
        expect(instance2.teardown).toHaveBeenCalled();
      });

      it('should support teardowns that cause other teardowns', function () {
        var TestComponent = defineComponent(testComponent);
        var instance1 = (new TestComponent).initialize(document.body)
        var instance2 = (new TestComponent).initialize(document.body);
        var original = instance1.teardown;
        instance1.teardown = function () {
          instance2.teardown();
          original.call(this);
        }.bind(instance1);
        expect(function () {
          TestComponent.teardownAll();
        }).not.toThrow();
      });

    });

  });
});
