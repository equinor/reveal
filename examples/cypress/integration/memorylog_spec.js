/* eslint-disable cypress/no-unnecessary-waiting */
describe('Memory logging', () => {
    it('Navigates the 3d model, and logs memory output to file', () => {
      cy.intercept("http://localhost:3000/primitives/sector*").as("getsectors");
      cy.intercept("http://localhost:3000/primitives/mesh*").as("getmeshes");


        cy.visit('http://localhost:3000/simple')
        cy.window().then(win => {
            win.controls = {}
          cy.wait(2000); // we're waiting (naively) to make sure fetching sectors (loading) has started before continuing
            cy.get(".cypress-loading-finished", {timeout: 22000})
            cy.get('canvas').trigger("wheel", {deltaY: 50}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
            cy.get('canvas').trigger("wheel", {deltaY: 50}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
            cy.get('canvas').trigger("wheel", {deltaY: 50}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
            cy.get('canvas').trigger("wheel", {deltaY: 50}).wait(300);

          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: 50}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: 50}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.get('canvas').trigger("wheel", {deltaY: 50}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: 50}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: 50}).wait(300);

          cy.get(".cypress-loading-finished", {timeout: 12000})
            cy.get('canvas').trigger("wheel", {deltaY: -50}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
            cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
            cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
            cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
            cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
            cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})
          cy.get('canvas').trigger("wheel", {deltaY: -100}).wait(300);
          cy.get(".cypress-loading-finished", {timeout: 12000})


            /*cy.get("body").trigger('mousedown', {force: true})
                .trigger('mousemove', 400, 200, {force: true})
                .trigger('mousemove', 300, 200, {force: true})
                .trigger('mouseup', 300, 200, {force: true})
*/

        })
    })
})
