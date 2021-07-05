document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails and store in a variable
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(function(email) {
      
      // Create div for each email
      const email_div = document.createElement('div');
      
      // Create spans for each email's elements, to put inside email div
      const email_sender = document.createElement('span');
      const email_subject = document.createElement('span');
      const email_time = document.createElement('span');

      // Enter content for spans
      email_sender.innerHTML = email.sender
      email_subject.innerHTML = email.subject
      email_time.innerHTML = email.timestamp

      // Add classes to spans for css formatting
      email_sender.classList.add('email-sender')
      email_subject.classList.add('email-subject')
      email_time.classList.add('email-time')
      
      // Append each span to the email div
      email_div.append(email_sender)
      email_div.append(email_subject)
      email_div.append(email_time)
      
      // Add classes to div for css formatting
      email_div.classList.add('email-line')

      // Add a class if the email has been read
      if (email.read === true) {
        email_div.classList.add('read');
      }

      // Add email div to main 'emails-view' div
      document.querySelector('#emails-view').append(email_div);

      
      // Add event listener to fetch individual email when clicked
      email_div.addEventListener('click', function() {
        get_email(email.id);
      });

    });
  });
}


function send_email() {

  // Create variables from existing text in form
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });
  
  load_mailbox('sent');

  // Prevent form submitting via HTML
  return false;
}

function get_email(id) {

  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    const sender = document.createElement('h6');
    const recipient = document.createElement('h6');
    const subject = document.createElement('h6');
    const timestamp = document.createElement('h6');
    const body = document.createElement('h6');
    const email_div = document.querySelector('#email-view');

    sender.innerHTML = `From: ${email.sender}`;
    recipient.innerHTML = `To: ${email.recipients}`;
    subject.innerHTML = `Subject: ${email.subject}`;
    timestamp.innerHTML = `TIme: ${email.timestamp}`;
    body.innerHTML = email.body
    
    // Clear existing content from email-view div
    email_div.innerHTML = '';

    email_div.append(sender);
    email_div.append(recipient);
    email_div.append(subject);
    email_div.append(timestamp);
    email_div.append(document.createElement('hr'));
    email_div.append(body);
  });

}