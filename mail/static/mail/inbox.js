document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('', '', ''));
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(to_text, subject_text, body_text) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Fill in composition fields with arguments
  document.querySelector('#compose-recipients').value = to_text;
  document.querySelector('#compose-subject').value = subject_text;
  document.querySelector('#compose-body').value = body_text;
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
      email_sender.innerHTML = email.sender;
      email_subject.innerHTML = email.subject;
      email_time.innerHTML = email.timestamp;

      // Add classes to spans for css formatting
      email_sender.classList.add('email-sender');
      email_subject.classList.add('email-subject');
      email_time.classList.add('email-time');
      
      // Append each span to the email div
      email_div.append(email_sender);
      email_div.append(email_subject)
      email_div.append(email_time);
      
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
        display_email(email, mailbox);
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
  
  // Delay loading of sent box to allow database time to update
  setTimeout(function() {
    load_mailbox('sent');
  }, 300)
  

  // Prevent form submitting via HTML
  return false;
}

function display_email(email, mailbox) {

  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Create elements to hold email content
  const sender = document.createElement('h6');
  const recipient = document.createElement('h6');
  const subject = document.createElement('h6');
  const timestamp = document.createElement('h6');
  const body = document.createElement('h6');
  const email_div = document.querySelector('#email-view');

  // Add email content to new elements
  sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
  recipient.innerHTML = `<strong>To:</strong> ${email.recipients}`;
  subject.innerHTML = `<strong>Subject</strong>: ${email.subject}`;
  timestamp.innerHTML = `<strong>Time</strong>: ${email.timestamp}`;
  body.innerHTML = email.body
  
  // Clear existing content from email-view div
  email_div.innerHTML = '';

  // Append email content to email-view div
  email_div.append(sender);
  email_div.append(recipient);
  email_div.append(subject);
  email_div.append(timestamp);

  // Add reply button
  reply_button = add_button('inbox', 'Reply');
  reply_button.addEventListener('click', function() {
    
    // Create subject for reply
    let reply_subject = email.subject
    // Prevent 'Re: ' from chaining on multiple replies
    if (reply_subject.substring(0, 4) === 'Re: ') {
    }
    else {
      reply_subject = `Re: ${email.subject}`;
    }  
    
    // Create email body for reply
    const reply_body = `On ${email.timestamp} ${email.sender} wrote:
      ${email.body}`

    compose_email(email.sender, reply_subject, reply_body);
  });
  
  email_div.append(reply_button);

  // Add archive button for inbox & archive but not sent
  if (mailbox === 'inbox' || mailbox === 'archive') {
    archive_button = add_button(mailbox, 'Archive');
    archive_button.addEventListener('click', function() {
      archive_email(email.id, email.archived === false);
    });
    email_div.append(archive_button);
  }
  
  email_div.append(document.createElement('hr'));
  email_div.append(body);

  update_read_status(email.id);
}

function add_button(mailbox, text) {
  
  const new_button = document.createElement('button');
  new_button.classList.add('btn');
  new_button.classList.add('btn-sm');
  new_button.classList.add('btn-outline-primary');
  new_button.classList.add('js-button');

  if (mailbox === 'archive' && text === 'Archive') {
    new_button.innerHTML = 'Unarchive';
  }
  else {
    new_button.innerHTML = text;
  }

  return new_button;
}

function update_read_status(id) {

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function archive_email(id, status) {

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: status
    })
  })
  
  // Delay loading of inbox to allow database time to update
  setTimeout(function() {
    load_mailbox('inbox');
  }, 300)
}