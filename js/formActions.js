document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('download-json').addEventListener('click', function() {
        if (!window.lastSubmission) {
            showNotificationModal('Please submit the form first');
            return;
        }

        downloadFile(window.lastSubmission)
    });

    document.getElementById('copy-json').addEventListener('click', function() {
        if (!window.lastSubmission) {
            showNotificationModal('Please submit the form first', 'warning');
            return;
        } 

        const jsonString = JSON.stringify(window.lastSubmission, null, 2);
        copyToClipboard(jsonString)
    });

    document.getElementById('email-json').addEventListener('click', function() {
        if (!window.lastSubmission) {
            showNotificationModal('Please submit the form first', 'warning');
            return;
        } 

        emailFile(window.lastSubmission);
    });
});

async function downloadFile(data) {
    try {
        const cleanData = {...data};
		delete cleanData.submit;

        const jsonData = await populateCodeJson(cleanData);

        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_');
        const filename = `user-feedback_${timestamp}.json`;

        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
       
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        console.log('File downloaded successfully!')
    } catch (error) {
        console.error("Error downloading file:", error);
        showNotificationModal("Error generating download. Please try again.", 'error');
    }
}

function copyToClipboard() {
    try {
        const textarea = document.getElementById('json-result');
        textarea.select();
        document.execCommand('copy');

        showNotificationModal('JSON copied to clipboard!', 'success');
    } catch (error) {
        console.error('Error copying to clipboard: ', error);
        showNotificationModal('Error copying to clipboard. Please try again.', 'error');
    }
}

function emailFile(data) {
    try {
        const cleanData = {...data};
        delete cleanData.submit;

        const jsonString = JSON.stringify(cleanData, null, 2);

        const subject = "Form Submission Results";
        const body = `Hello,\n\nHere are my survey results:\n\n${jsonString}\n\nThank you!`;

        const recipients = ["dinne.kopelevich@cms.hhs.gov", "opensource@cms.hhs.gov"];

        const mailtoLink = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;

        console.log("Email client opened");
    } catch {
        console.error("Error preparing email:", error);
        showNotificationModal("Error preparing email. Please try again or copy the data manually.", 'error');
    }
}