# MeetingPlannerFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.9.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Prerequisites
 Note : you can skip installation steps if already installed in your system.
  1. Angular CLI(how to install? <a href="https://cli.angular.io/">NodeJs</a>)
  
  2. Install Git (how to install? <a href="https://git-scm.com/downloads">Git Hub</a>)

  
## running locally
 
 1. create new folder in your system
 2. open that folder in cmd or linux terminal and execute following commands in sequence.
 
 ```
 > git init
 > git remote add origin https://github.com/bhaskar-repo/meeting-planner-frontend.git
 > git pull origin master
 > npm install
 ```
 above commands will pull project to your newly created folder. and npm install will add project dependencies.
```
 > ng serve --open
```
## More About Application
Meeting Planner	

Applications has mainly three modules
 
  * **USER MODULE** 
  * **MEETING MODULE**
  * **SHARED MODULE**
  
  * USER -> it includes sign up,login,requests,activities,friends,find friends functionalities
		signup -> during sign up user is able to sign up with country and country phone code.
			   -> added validation for fields like email,password and mobile
			   -> upon login user will be redirected to login page.
		login  -> user can login through registered email followed authentication mechanism generating jwt.
				  client side from validation for gmail and password is added.
		-> upon login user will see his meetings organized by admin in calendar form
		-> user can only see his meetings he can not make any updates for view there is a seperate view
		
 * MEETING -> Admin user is able to add,edit and delete meeting of the user
		 -> Admin can edit any user's meeting.from users dashboard.
		 -> Meetings are shown in calendar form with all functionalities added.
		
 * SHARED MODULE -> all the common things requred are kept here,
				-> header is kept in this module all the major actions have seperated with nav bar links
				-> http header is a component when any error the user will be redirected to this page
				-> hanled error with diffrent page.
				
 * Exra points -> 
			- > added icon for each action.

note: i am storing my secretKey in database. need to add an entry for each db connection (secretKey: "") in globalcofig table

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Built With

* [NPM](https://www.npmjs.com/) - Most of the modules are used
* [nodemailer](https://nodemailer.com/about/) - NPM module to send the mails
* [apiDoc](http://apidocjs.com/) - NPM module to create the apiDoc and eventDoc
* [nodejs](https://nodejs.org)- Node js to write back end

## Authors

* **Bhaskar Pawar** - *Initial work* - [bhaskarpawar](https://github.com/bhaskar-repo)
* **Edwisor** - *Problem Statement* - [Edwisor](https://www.edwisor.com)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for detailsg

## Acknowledgments

* Thanks for Edwisor to review this application.
* I would like to thank whoever supported for implenting this front end for meeting planner application.

