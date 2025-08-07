---
title: AWS Amplify Admin UI user management instead of self sign up
date: 2020-12-06 08:15:18
summary: Description of the change from a self sign up to user management from an admin
categories: aws
thumbnail: amplify
tags:
  - aws
  - AWS Amplify
  - AWS Amplify Admin UI
published: true
---

In my web app, I use the authentification [UI Compontents](https://docs.amplify.aws/ui/auth/authenticator/q/framework/react) of Amplify. Without any configuration, this UI component comes with a signup link so that any person who knows the URL can signup for themself. However, this web app is for a certain group of users. That's why I want to create users who are allowed to sign in.

And this is now possible in an easy way via the new Amplify Admin UI.

# The Amplify Admin UI

The Amplify Admin UI has a big set of functions. You can check the [docs](https://docs.amplify.aws/console/adminui/intro) for more details or test it in a [sandbox](https://sandbox.amplifyapp.com/getting-started).
This [post](https://dev.to/aws-builders/aws-amplify-admin-ui-45bm) also gives an excellent overview.

# Hide the signup link

At first, I had to hide the signup link to avoid that everyone can signup.

![signin with signup]({{ site.baseurl }}/img/2020-12-06-amplify_admin_ui_user_management/signin_with_signup.png)

To hide the signup link is just one line.

```html
<AmplifyAuthenticator>
  <AmplifySignIn hideSignUp="true" slot="sign-in" />
</AmplifyAuthenticator>
```

More options are described in the [docs](https://docs.amplify.aws/ui/auth/authenticator/q/framework/react#sign-in)

Then it looks like that.

![signin without signup]({{ site.baseurl }}/img/2020-12-06-amplify_admin_ui_user_management/signin_without_signup.png)

# Create a new user via Amplify Admin UI

If a new user is needed, you can create on via the Amplify Admin UI.
That you can use the Admin UI, it is just a click in the Amplify [Console](https://console.aws.amazon.com/amplify/home).

![enabled admin ui]({{ site.baseurl }}/img/2020-12-06-amplify_admin_ui_user_management/enabled_admin_ui.png)

In the Admin UI, it's in the section user management. Click on "create user".

![user management create user]({{ site.baseurl }}/img/2020-12-06-amplify_admin_ui_user_management/user_management_create_user.png)

Type in the user data. The user will get an email with the username and temporary password.

![user management user data]({{ site.baseurl }}/img/2020-12-06-amplify_admin_ui_user_management/user_management_user_data.png)

# User sign in process

Then the user can log in with his username and temporary password.

![user signin tempory password]({{ site.baseurl }}/img/2020-12-06-amplify_admin_ui_user_management/user_signin_tempory_password.png)

At the next screen, the user has to create a new password.

![user signin new password]({{ site.baseurl }}/img/2020-12-06-amplify_admin_ui_user_management/user_signin_new_password.png)

Two screens are left. One for the email verification...

![user signin verify]({{ site.baseurl }}/img/2020-12-06-amplify_admin_ui_user_management/user_signin_verify.png)

...and the last one for the verification code.

![user signin verification code]({{ site.baseurl }}/img/2020-12-06-amplify_admin_ui_user_management/user_signin_verification_code.png)

The last step is not necessary if the admin marks the email as verified.

![admin verify email]({{ site.baseurl }}/img/2020-12-06-amplify_admin_ui_user_management/admin_verify_email.png)

That's it 🎉

![user after signin]({{ site.baseurl }}/img/2020-12-06-amplify_admin_ui_user_management/user_after_signin.png)

# Invite User to the Admin UI

Now with the Admin UI, it is also possible to invite users as admins. Even without access to the AWS account.
See details [here](https://docs.amplify.aws/console/adminui/access-management).

# Code

[https://github.com/JohannesKonings/fff-badminton](https://github.com/JohannesKonings/fff-badminton)
