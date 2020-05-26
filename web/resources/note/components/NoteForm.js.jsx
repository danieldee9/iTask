/**
 * Reusable stateless form component for Note
 */

// import primary libraries
import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// import form components
import { TextAreaInput } from "../../../global/components/forms";

var moment = require("moment"); // Display Date and Time

const NoteForm = ({
  formTitle,
  formType,
  handleFormChange,
  handleFormSubmit,
  note,
  isNoteListEmpty,
  isNoteListFetching,
  noteListItems
}) => {

  const getProfileImage = (user) => {
    let pictureUrl = '/img/defaults/profile.png';

    if(user && user.profilePicUrl) {
      // eslint-disable-next-line prefer-destructuring
      pictureUrl = user.pictureUrl;
    }

    return {backgroundImage: `url(${pictureUrl})`};
  }
  
  const Comments = () => {
    return (
      <div style={{ opacity: isNoteListFetching ? 0.5 : 1 }}>
        <ul>
          {noteListItems.map((data, i) => (
            <li style={{ listStyle: "none" }} key={data._id + i}>
              <div className="profile-img-wrapper">
                <div className="profile-img" style={getProfileImage(note._user)}></div>
                <b>
                  {data._user.firstName}{" "}{data._user.lastName}
                </b>
              </div>
              <p style={{ fontSize: 10, marginTop: -20, marginLeft: 45 }}>
                {moment(data.created).calendar()}
              </p>
              <p style={{ marginLeft: 45 }}>{data.content}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // set the button text
  const buttonText = formType === "create" ? "Add Comment" : "Update Comment";

  // set the form header
  const header = formTitle ? (
    <div className="formHeader">
      <h2> {formTitle} </h2>
      <hr />
    </div>
  ) : (
    <div />
  );

  return (
    <div className="yt-container">
      <div className="yt-row center-horiz">
        <div className="form-container -slim">
          {isNoteListEmpty ? (
            isNoteListFetching ? (
              <h2>Loading...</h2>
            ) : (
              <h2>Empty.</h2>
            )
          ) : (
            Comments()
          )}
          <form
            name="noteForm"
            className="note-form"
            onSubmit={handleFormSubmit}
          >
            {header}
            <TextAreaInput
              change={handleFormChange}
              name="note.content"
              placeholder="Type here..."
              value={note && note.content}
            />
            <div className="input-group">
              <div className="yt-row space-between">
                <button className="yt-btn " type="submit">
                  {" "}
                  {buttonText}{" "}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

NoteForm.propTypes = {
  formHelpers: PropTypes.object,
  formTitle: PropTypes.string,
  formType: PropTypes.string.isRequired,
  handleFormChange: PropTypes.func.isRequired,
  handleFormSubmit: PropTypes.func.isRequired,
  note: PropTypes.object.isRequired,
};

NoteForm.defaultProps = {
  formHelpers: {},
  formTitle: "",
};

export default NoteForm;
