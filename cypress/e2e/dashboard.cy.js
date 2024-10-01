describe('testing of dashboard', () => {

  beforeEach(function () {
    cy.fixture('login_data.json').then((loginData) => {
      this.user = loginData.user
    })
  })


  it('log in page opens successfully', () => {
    cy.visit('/login')
    cy.contains('Log in')
  });

  it('should log in with email and password', function () { 
    
    cy.visit('/')
    cy.contains('Use password') // FIXME: we should have some test id ideally
      .click()

    cy.get('#email').type(this.user.username)
    cy.get('#password').type(this.user.password, {log:false})
  
    cy.intercept('POST', 'login', {}).as('loginPost')
    cy.get('form').submit() // FIXME: we should have some test id ideally 
    cy.wait('@loginPost').its('request.body.accessToken').should('exist').should('not.be.empty')
  })

  it.only('creates and deletes post', function () { 
    cy.visit('/')
    cy.contains('Use password') // FIXME: we should have some test id ideally
      .click()

    cy.get('#email').type(this.user.username)
    cy.get('#password').type(this.user.password, {log:false})

    //here we verify the post request is created and includes an access token
    cy.intercept('POST', 'login', {}).as('loginPost')
    cy.get('form').submit()
    cy.wait('@loginPost').its('request.body.accessToken').should('exist').should('not.be.empty')

    cy.get('[data-test-id="panel_start-conversation"]')
      .click()

    // https://github.com/ckeditor/ckeditor5/issues/12802#issuecomment-1459147156
    cy.get('[data-test-id="post-editor_content"] .ck-content[contenteditable=true]').then(el => {
        const editor = el[0].ckeditorInstance 
        editor.setData('Test Post')
      }) 
        
    cy.get('[data-test-id="post-editor_header"] .ant-select')
      .click()
    cy.get('.ant-select-item-option-content').contains('BigHeart Philanthropy') // FIXME: we should have some test id ideally
      .click()
      
     // here we intercept the post request to get the postId 
    let newPostId;
      
    cy.intercept('POST', 'posts', (req) => {
      req.continue((response) => {
        newPostId = response.body.post.id;
        expect(newPostId).not.to.be.undefined;
      })
    }).as('createNewPost')

    // here we intercept the delete request
    cy.intercept('DELETE', '**/posts/**', {}).as('deletePost')

    //here we create a new request
    cy.get('[data-test-id="post-editor_wrapper"] form').submit()
 
    //here we verify with the post id from variable newPostId that the post has been successully created and it has the correct text
    cy.wait('@createNewPost').then(() => {
      cy.get(`#post_${newPostId}`).should('exist')
      cy.get(`#post_${newPostId} .ck-content p`).should('have.text', 'Test Post')

      cy.get(`#post_${newPostId} .feed-header__actions button.ant-dropdown-trigger`) // FIXME: we should have some test id ideally
        .click()
       
      cy.get('.ant-dropdown-menu-item-danger').click()
    })

    //here we verify the post has been successfully deleted
    cy.wait('@deletePost').then(() => {
      cy.get(`#post_${newPostId}`).should('not.exist')
    })

  });

})