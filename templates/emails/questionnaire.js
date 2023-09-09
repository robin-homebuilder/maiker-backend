exports.questionnaire = async ({ files, parsedOwner, parsedProjectOne, parsedMailAddress, parsedSiteAddress, parsedProjectTwo, parsedClientBrief }) => {
  let fileData = "";
  let owners = "";

  if(files.length > 0){
    await Promise.all(files.map(async (file) => {
      fileData += `<p><a href="${file.url}" target="_blank">${file.fileName}</a></p>`
    }));
  } else{
    fileData + "No files were included";
  }
  
  if(parsedOwner.length > 0){
    owners += "<ul>";
    await Promise.all(parsedOwner.map(async (owner) => {
      if(owner.type == "individual_owner"){
        owners += `
          <li>
            <h3>Individual Owner</h3>
            <ul>
              <li><strong>First Name:</strong> ${owner.first_name}</li>
              <li><strong>Last Name:</strong> ${owner.last_name}</li>
              <li><strong>Phone:</strong> ${owner.phone}</li>
              <li><strong>Email:</strong> ${owner.email}</li>
            </ul>
          </li>`;
      } else if(owner.type == "company_owner"){
        owners += `
          <li>
            <h3>Company Owner</h3>
            <ul>
              <li><strong>Company Name:</strong> ${owner.company_name}</li>
              <li><strong>ABN:</strong> ${owner.abn}</li>
              <li><strong>First Name:</strong> ${owner.first_name}</li>
              <li><strong>Last Name:</strong> ${owner.last_name}</li>
              <li><strong>Phone:</strong> ${owner.phone}</li>
              <li><strong>Email:</strong> ${owner.email}</li>
            </ul>
          </li>`;
      } else if(owner.type == "trust_owner"){
        owners += `
          <li>
            <h3>Trust Owner</h3>
            <ul>
              <li><strong>Trustee Name:</strong> ${owner.trustee_name}</li>
              <li><strong>Trust Name:</strong> ${owner.trust_name}</li>
              <li><strong>ABN:</strong> ${owner.abn}</li>
              <li><strong>First Name:</strong> ${owner.first_name}</li>
              <li><strong>Last Name:</strong> ${owner.last_name}</li>
              <li><strong>Phone:</strong> ${owner.phone}</li>
              <li><strong>Email:</strong> ${owner.email}</li>
            </ul>
          </li>`;
      }
    }));
    owners += "</ul>";
  }
  
  const template = `
    <html>
      <body>
        <h1>Questionnaire</h1>
        <hr />
        <h2>1. Client Information</h2>
        ${owners}
        <hr />
        <h2>2. Mailing Address</h2>
        <p><strong>Address: </strong>${parsedMailAddress.address}</p>
        <p><strong>Address Line 1: </strong>${parsedMailAddress.address_line_1}</p>
        <p><strong>Address Line 2: </strong>${parsedMailAddress.address_line_2}</p>
        <p><strong>Suburb: </strong>${parsedMailAddress.suburb}</p>
        <p><strong>State: </strong>${parsedMailAddress.state}</p>
        <p><strong>Postcode: </strong>${parsedMailAddress.postcode}</p>
        <hr />
        <h2>3. Site Address</h2>
        <p><strong>Address: </strong>${parsedSiteAddress.address}</p>
        <p><strong>Address Line 1: </strong>${parsedSiteAddress.address_line_1}</p>
        <p><strong>Address Line 2: </strong>${parsedSiteAddress.address_line_2}</p>
        <p><strong>Suburb: </strong>${parsedSiteAddress.suburb}</p>
        <p><strong>State: </strong>${parsedSiteAddress.state}</p>
        <p><strong>Postcode: </strong>${parsedSiteAddress.postcode}</p>
        <hr />
        <h2>4. Project Information - Part 1</h2>
        <p><strong>What type of project type does your enquiry relate to?</strong></p>
        <p>${parsedProjectOne.project_type}</p>
        <p><strong>Do you have plans for your Home Construction project or are you in process of completing plans?</strong></p>
        <p>${parsedProjectOne.complete_plan}</p>
        <p><strong>Who is your Architect or Home Designer?</strong></p>
        <ul>
          <li><strong>Architect Name: </strong>${parsedProjectOne.architect_name}</li>
          <li><strong>Architect Contact: </strong>${parsedProjectOne.architect_contact}</li>
        </ul>
        <p><strong>Please select from the following list if you have any of the following:</strong></p>
        ${parsedProjectOne.project_checkbox.length > 0 ? 
          `<ul>
            ${parsedProjectOne.project_checkbox.map((item) => (
              `<li>${item}</li>`
            )).join('')}
          </ul>` 
          : "None were selected"}
        <h3>Files</h3>
        ${fileData}
        <hr />
        <h2>5. Project Information - Part 2</h2>
        <p><strong>When are you looking to commence your project?</strong></p>
        <p>${parsedProjectTwo.commence}<p>
        <p><strong>For Extensions/Renovations do you intend to move out during the works?</strong></p>
        <p>${parsedProjectTwo.extensions}<p>
        <p><strong>Do you have a project budget?</strong></p>
        <p>${parsedProjectTwo.project_budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}<p>
        <p><strong>Do you have plans for your Home Construction project or are you in process of completing plans?</strong></p>
        <p>${parsedProjectTwo.completing_plan}<p>
        ${parsedProjectTwo.completing_plan == "Yes" ?
          (`<p><strong>Who was the builder?</strong></p>
          <p>${parsedProjectTwo.builder}<p>`)
          : ""
        }
        <p><strong>Are you speaking with them and are they quoting as well?</strong></p>
        <p>${parsedProjectTwo.quoting}<p>
        <p><strong>Have you spoken to any other Builder's in regards to your proposed works?</strong></p>
        <p>${parsedProjectTwo.proposed_works}<p>
        <hr />
        <h2>6. Client Brief</h2>
        <p><strong>Please provide a brief description of the works with anything else you would like to add that may assist us with your enquiry:</strong></p>
        <p>${parsedClientBrief.brief_information}<p>
        <p><strong>What do you need next in order to proceed with your proposed project?</strong></p>
        ${parsedClientBrief.client_checkbox.length > 0 ? 
          `<ul>
            ${parsedClientBrief.client_checkbox.map((item) => (
              `<li>${item}</li>`
            )).join('')}
          </ul>` 
          : "None were selected"}
        ${parsedClientBrief.other_requirements ? 
          `<p><strong>Other Requirements:</strong></p>
          <p>${parsedClientBrief.other_requirements}</p>`
        :""}
      </body>
    </html>`;

  return template;
};

// data:image/jpeg;base64,${logo}