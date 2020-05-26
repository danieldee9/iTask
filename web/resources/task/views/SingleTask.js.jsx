/**
 * View component for /tasks/:taskId
 *
 * Displays a single task from the 'byId' map in the task reducer
 * as defined by the 'selected' property
 */

// import primary libraries
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";

// import actions
import * as taskActions from "../taskActions";
import * as noteActions from "../../note/noteActions";
import * as userActions from "../../user/userActions";

// import global components
import Binder from "../../../global/components/Binder.js.jsx";

// import resource components
import TaskLayout from "../components/TaskLayout.js.jsx";
import NoteForm from "../../note/components/NoteForm.js.jsx";

class SingleTask extends Binder {
  constructor(props) {
    super(props);
    const { match, taskStore} = this.props;
    this.state = {
      note: _.cloneDeep(this.props.defaultNote.obj),
      taskFormHelpers: {},
      task: taskStore.byId[match.params.taskId]
        ? _.cloneDeep(taskStore.byId[match.params.taskId])
        : {},
    };

    this._bind("_handleFormChange", "_handleFormSubmit");
  }

  componentDidMount() {
    const { dispatch, match, user } = this.props;
    dispatch(taskActions.fetchSingleIfNeeded(match.params.taskId));
    dispatch(noteActions.fetchDefaultNote());
    dispatch(noteActions.fetchListIfNeeded("_task", match.params.taskId));
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, match, taskStore } = this.props;
    dispatch(noteActions.fetchListIfNeeded("_task", match.params.taskId));
    this.setState({
      note: _.cloneDeep(nextProps.defaultNote.obj),
      task: taskStore.byId[match.params.taskId]
        ? _.cloneDeep(taskStore.byId[match.params.taskId])
        : {},
    });
  }

  _handleFormChange(e) {
    /**
     * This let's us change arbitrarily nested objects with one pass
     */
    let newState = _.update(this.state, e.target.name, () => {
      return e.target.value;
    });
    this.setState({ newState });
  }

  _handleFormSubmit(e) {
    e.preventDefault();
    const { defaultNote, dispatch, match, user, flowStore } = this.props;
    let newNote = { ...this.state.note };

    newNote._task = match.params.taskId;
    newNote._flow = flowStore.selected.id;
    newNote._user = user._id
    
    dispatch(noteActions.sendCreateNote(newNote)).then((noteRes) => {
      if (noteRes.success) {
        dispatch(noteActions.invalidateList("_task", match.params.taskId));
        this.setState({
          note: _.cloneDeep(defaultNote.obj),
        });
      } else {
        alert("ERROR - Check logs");
      }
    });
  }

  _handleClick(action) {
    const { taskStore, dispatch, match, flowStore, history } = this.props;
    const taskData = taskStore.selected.getItem();
    if (action === "approved") {
      let taskStatus = { ...this.state.task };

      taskStatus._flow = flowStore.selected.id;
      taskStatus.name = taskData.name;
      taskStatus.complete = true;
      taskStatus.status = "approved";
      taskStatus._id = match.params.taskId;

      dispatch(taskActions.sendUpdateTask(taskStatus)).then((taskRes) => {
        if (taskRes.success) {
          history.push(`/tasks/${taskRes.item._id}`);
          alert("Task approved!");
        } else {
          alert("ERROR - Check logs");
        }
      });
    } else if (action === "rejected") {
      let taskStatus = { ...this.state.task };

      taskStatus._flow = flowStore.selected.id;
      taskStatus.name = taskData.name;
      taskStatus.complete = false;
      taskStatus.status = "awaiting_approval";
      taskStatus._id = match.params.taskId;

      dispatch(taskActions.sendUpdateTask(taskStatus)).then((taskRes) => {
        if (taskRes.success) {
          history.push(`/tasks/${taskRes.item._id}`);
          alert("Task rejected!");
        } else {
          alert("ERROR - Check logs");
        }
      });
    }
  }

  render() {
    const { taskStore, match, noteStore, user, flowStore } = this.props;
    const { note, formHelpers, task } = this.state;

    /**
     * use the selected.getItem() utility to pull the actual task object from the map
     */
    const selectedTask = taskStore.selected.getItem();

    // get the taskList meta info here so we can reference 'isFetching'
    const noteList =
      noteStore.lists && noteStore.lists._task
        ? noteStore.lists._task[match.params.taskId]
        : null;

    /**
     * use the reducer getList utility to convert the all.items array of ids
     * to the actual task objetcs
     */
    const noteListItems = noteStore.util.getList("_task", match.params.taskId);

    const isEmpty =
      !selectedTask || !selectedTask._id || taskStore.selected.didInvalidate;

    const isFetching = taskStore.selected.isFetching;

    const isNoteListEmpty = !noteListItems || !noteList;

    const isNoteListFetching =
      !noteListItems || !noteList || noteList.isFetching;
    return (
      <TaskLayout>
        <h3> Single Task </h3>
        {isEmpty ? (
          isFetching ? (
            <h2>Loading...</h2>
          ) : (
            <h2>Empty.</h2>
          )
        ) : (
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            {task && task.status != "approved" ? (
              <div>
                <h1>
                  <input
                    type="checkbox"
                    checked=""
                    style={{
                      left: 0,
                      height: 25,
                      width: 25,
                      marginRight: 10,
                    }}
                  />
                  {selectedTask.name}
                </h1>
              </div>
            ) : (
              <div>
                <h1>
                  <input
                    type="checkbox"
                    checked="checked"
                    style={{
                      left: 0,
                      height: 25,
                      width: 25,
                      marginRight: 10,
                    }}
                  />
                  {selectedTask.name}
                </h1>
              </div>
            )}
            <p>{selectedTask.description}</p>
            <br />
            {user.roles &&
              user.roles[0] === "admin" &&
              (task.status === "approved" ? (
                <div>
                  <button
                    disabled
                    className="yt-btn x-small success"
                    style={{ marginRight: 10 }}
                    onClick={this._handleClick.bind(this, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="yt-btn x-small primary"
                    onClick={this._handleClick.bind(this, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    className="yt-btn x-small success"
                    style={{ marginRight: 10 }}
                    onClick={this._handleClick.bind(this, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="yt-btn x-small primary"
                    onClick={this._handleClick.bind(this, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              ))}
            <hr />
            <Link to={`/flows/${flowStore.selected.id}`}>
              <button className="yt-btn link x-small">Go back</button>
            </Link>
            <NoteForm
              note={note}
              formHelpers={formHelpers}
              formType="create"
              handleFormChange={this._handleFormChange}
              handleFormSubmit={this._handleFormSubmit}
              noteListItems={noteListItems}
              isNoteListEmpty={isNoteListEmpty}
              isNoteListFetching={isNoteListFetching}
            />
            <br />
            <Link to={`${this.props.match.url}/update`}> Update Task </Link>
          </div>
        )}
      </TaskLayout>
    );
  }
}

SingleTask.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStoreToProps = (store) => {
  /**
   * NOTE: Yote refer's to the global Redux 'state' as 'store' to keep it mentally
   * differentiated from the React component's internal state
   */
  return {
    defaultNote: store.note.defaultItem,
    taskStore: store.task,
    noteStore: store.note,
    user: store.user.loggedIn.user,
    flowStore: store.flow,
  };
};

export default withRouter(connect(mapStoreToProps)(SingleTask));
