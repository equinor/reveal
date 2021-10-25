/*!
 * Copyright 2021 Cognite AS
 */

import TWEEN from '@tweenjs/tween.js';

import { Cognite3DModel } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { Keyframe } from './Keyframe';

/**
 * Tool to applying styles to nodes based on date to play them over in Timeline
 */
export class TimelineTool extends Cognite3DViewerToolBase {
  private readonly _model: Cognite3DModel;
  private _keyframes: Keyframe[];
  private _playback: TWEEN.Tween | undefined = undefined;

  constructor(cadModel: Cognite3DModel) {
    super();

    this._model = cadModel;
    this._keyframes = new Array<Keyframe>();
  }

  /**
   * Create Key frame for the Timeline
   * @param date - date value by Date.now() since January 1, 1970
   */
  public createKeyframe(date: Date): Keyframe {
    const keyframe = new Keyframe(this._model, date);
    this._keyframes.push(keyframe);
    this.sortKeyframesByDates();

    return keyframe;
  }

  /**
   * Returns the keyframe at the date given, or undefined if not found.
   * @param date
   * @returns
   */
  public getKeyframeByDate(date: Date): Keyframe | undefined {
    return this._keyframes.find(candidate => candidate.getKeyframeDate() === date);
  }

  /**
   * Removes the Keyframe from the Timeline
   * @param keyframe - Keyframe to be removed from the Timeline
   */
  public removeKeyframe(keyframe: Keyframe) {
    if (this._keyframes.length > 0) {
      const index = this._keyframes.findIndex(obj => obj === keyframe);

      if (index > -1) {
        this._keyframes = this._keyframes.splice(index, 1);
      }
    }
  }

  /**
   * Removes the Keyframe from the Timeline
   * @param date - Date of the Keyframe to be removed from the Timeline
   */
  public removeKeyframeByDate(date: Date) {
    if (this._keyframes.length > 0) {
      const index = this._keyframes.findIndex(obj => obj.getKeyframeDate() === date);

      if (index > -1) {
        this._keyframes = this._keyframes.splice(index, 1);
      }
    }
  }

  /**
   * Starts playback of Timeline
   * @param startDate - Keyframe date to start the Playback of Keyframes
   * @param endDate - Keyframe date to stop the Playback of Keyframes
   * @param totalDurationInMilliSeconds - Number of milliseconds for all Keyframe within startDate & endDate to be rendered
   */
  public play(startDate: Date, endDate: Date, totalDurationInMilliSeconds: number) {
    this.stopPlayback();

    const playState = { dateInMs: startDate.getTime() };
    const to = { dateInMs: endDate.getTime() };
    const tween = new TWEEN.Tween(playState).to(to, totalDurationInMilliSeconds);
    let currentKeyframeIndex = -1;
    tween.onUpdate(() => {
      const date = new Date(playState.dateInMs);

      // Forward active keyframe to last keyframe that is before current date
      const prevIndex = currentKeyframeIndex;
      while (
        currentKeyframeIndex < this._keyframes.length - 1 &&
        this._keyframes[currentKeyframeIndex + 1].getKeyframeDate().getTime() <= date.getTime()
      ) {
        currentKeyframeIndex++;
      }

      if (currentKeyframeIndex !== prevIndex) {
        if (prevIndex !== -1) {
          this._keyframes[prevIndex].deactivate();
        }
        this._keyframes[currentKeyframeIndex].activate();
      }
    });

    this._playback = tween;
    tween.start();
  }

  /**
   * Stops any ongoing playback
   */
  public stopPlayback() {
    if (this._playback !== undefined) {
      this._playback.stop();
      this._playback = undefined;
    }
  }

  /**
   * Restores the Style of the model to default style
   */
  public resetStyles() {
    for (const keyframe of this._keyframes) {
      keyframe.deactivate();
    }
  }

  /**
   * Provides all Keyframes in the Timeline
   * @returns All Keyframes in Timeline
   */
  public getAllKeyframes(): Keyframe[] {
    return this._keyframes;
  }

  public dispose(): void {
    super.dispose();
    this.resetStyles();
  }

  /**
   * Sort the Timeline Keyframe by their Date
   */
  private sortKeyframesByDates() {
    if (this._keyframes.length > 1) {
      this._keyframes.sort((a: Keyframe, b: Keyframe) => {
        return a.getKeyframeDate().getTime() - b.getKeyframeDate().getTime();
      });
    }
  }
}
